from datetime import datetime, timedelta, timezone
from bson import ObjectId
from app.db.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_refresh_token
)
from app.utils.helpers import generate_otp, send_otp_email
from app.core.logger import get_logger

logger = get_logger(__name__)

def _serialize(user: dict) -> dict:
    user["id"] = str(user.pop("_id"))
    return user

# ── helper: makes MongoDB datetime comparable with UTC now ────────────────────
def _utc(dt: datetime) -> datetime:
    """Strip or add timezone so comparison always works."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

def _now() -> datetime:
    return datetime.now(timezone.utc)

# ── signup ────────────────────────────────────────────────────────────────────

async def signup(name: str, email: str, password: str) -> dict:
    db = get_db()

    existing = await db.users.find_one({"email": email})

    if existing:
        # If already verified — block them
        if existing.get("is_verified"):
            raise ValueError("User already exists")
        # If not verified yet — delete old record and let them re-signup
        await db.users.delete_one({"email": email})

    otp = generate_otp()
    expiry = _now() + timedelta(minutes=5)

    result = await db.users.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "google_user": False,
        "is_verified": False,
        "otp": otp,
        "otp_expiry": expiry,
        "reset_otp": None,
        "reset_otp_expiry": None,
        "reset_verified": False,
        "created_at": _now()
    })

    await send_otp_email(email, otp)
    return {"userId": str(result.inserted_id)}

# ── verify OTP ────────────────────────────────────────────────────────────────

async def verify_otp(user_id: str, otp: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise ValueError("User not found")
    if user["otp"] != otp:
        raise ValueError("Invalid OTP")
    if _utc(user["otp_expiry"]) < _now():        # ← fixed
        raise ValueError("OTP expired")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_verified": True, "otp": None, "otp_expiry": None}}
    )
    return {"message": "Email verified successfully"}

# ── login ─────────────────────────────────────────────────────────────────────

async def login(email: str, password: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email})

    if not user:
        raise ValueError("User not found")
    if not user.get("is_verified"):
        raise ValueError("Please verify your email first")
    if not verify_password(password, user.get("password", "")):
        raise ValueError("Wrong password")

    uid = str(user["_id"])
    return {
        "accessToken": create_access_token({"id": uid}),
        "refreshToken": create_refresh_token({"id": uid}),
        "user": {
            "id": uid,
            "name": user["name"],
            "email": user["email"],
            "is_verified": user["is_verified"],
            "google_user": user["google_user"]
        }
    }

# ── refresh token ─────────────────────────────────────────────────────────────

async def refresh_access_token(refresh_token: str) -> dict:
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise ValueError("Invalid or expired refresh token")
    return {"accessToken": create_access_token({"id": payload["id"]})}

# ── forgot password ───────────────────────────────────────────────────────────

async def forgot_password(email: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email})
    if not user:
        raise ValueError("User not found")

    otp = generate_otp()
    expiry = _now() + timedelta(minutes=5)

    await db.users.update_one(
        {"email": email},
        {"$set": {
            "reset_otp": otp,
            "reset_otp_expiry": expiry,
            "reset_verified": False
        }}
    )
    await send_otp_email(email, otp)
    return {"message": "Reset OTP sent to email"}

# ── verify reset OTP ──────────────────────────────────────────────────────────

async def verify_reset_otp(email: str, otp: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email})

    if not user:
        raise ValueError("User not found")
    if user["reset_otp"] != otp:
        raise ValueError("Invalid OTP")
    if _utc(user["reset_otp_expiry"]) < _now():  # ← fixed
        raise ValueError("OTP expired")

    await db.users.update_one(
        {"email": email},
        {"$set": {
            "reset_verified": True,
            "reset_otp": None,
            "reset_otp_expiry": None
        }}
    )
    return {"message": "OTP verified"}

# ── reset password ────────────────────────────────────────────────────────────

async def reset_password(email: str, new_password: str) -> dict:
    db = get_db()
    user = await db.users.find_one({"email": email})

    if not user:
        raise ValueError("User not found")
    if not user.get("reset_verified"):
        raise ValueError("OTP not verified")

    await db.users.update_one(
        {"email": email},
        {"$set": {
            "password": hash_password(new_password),
            "reset_verified": False
        }}
    )
    return {"message": "Password reset successful"}

# ── google login ──────────────────────────────────────────────────────────────

async def google_login(token: str) -> dict:
    from google.oauth2 import id_token
    from google.auth.transport import requests as grequests
    from app.core.config import settings

    try:
        payload = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except Exception as e:
        print(f"GOOGLE ERROR: {e}")        # ← shows exact reason
        raise ValueError("Invalid Google token")

    email = payload["email"]
    name = payload["name"]
    db = get_db()
    user = await db.users.find_one({"email": email})

    if not user:
        result = await db.users.insert_one({
            "name": name,
            "email": email,
            "password": None,
            "google_user": True,
            "is_verified": True,
            "otp": None,
            "otp_expiry": None,
            "reset_otp": None,
            "reset_otp_expiry": None,
            "reset_verified": False,
            "created_at": _now()
        })
        uid = str(result.inserted_id)
    else:
        uid = str(user["_id"])

    return {
        "accessToken": create_access_token({"id": uid}),
        "refreshToken": create_refresh_token({"id": uid})
    }

# ── get profile ───────────────────────────────────────────────────────────────

async def get_profile(user_id: str) -> dict:
    db = get_db()
    user = await db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"password": 0}
    )
    if not user:
        raise ValueError("User not found")
    return _serialize(user)
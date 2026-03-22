from datetime import datetime, timedelta, timezone
from bson import ObjectId
from app.db.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token
)
from app.utils.helpers import generate_otp, send_otp_email
from app.core.logger import get_logger

logger = get_logger(__name__)

def _utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

def _now() -> datetime:
    return datetime.now(timezone.utc)

def _serialize(museum: dict) -> dict:
    museum["id"] = str(museum.pop("_id"))
    return museum

# ── signup ────────────────────────────────────────────────────────────────────

async def signup(data: dict) -> dict:
    db = get_db()

    existing = await db.museums.find_one({"email": data["email"]})

    if existing:
        if existing.get("is_verified"):
            raise ValueError("Museum already registered")
        await db.museums.delete_one({"email": data["email"]})

    # ← these must be OUTSIDE the if block
    otp = generate_otp(4)
    expiry = _now() + timedelta(minutes=5)

    result = await db.museums.insert_one({
        "museumName": data["museumName"],
        "email": data["email"],
        "phone": data["phone"],
        "location": data["location"],
        "password": hash_password(data["password"]),
        "is_verified": False,
        "otp": otp,
        "otp_expiry": expiry,
        "reset_otp": None,
        "reset_otp_expiry": None,
        "reset_verified": False,
        "created_at": _now()
    })

    await send_otp_email(data["email"], otp)
    return {"museumId": str(result.inserted_id)}
# ── verify OTP ────────────────────────────────────────────────────────────────

async def verify_otp(museum_id: str, otp: str) -> dict:
    db = get_db()
    museum = await db.museums.find_one({"_id": ObjectId(museum_id)})

    if not museum:
        raise ValueError("Museum not found")
    if museum["otp"] != otp:
        raise ValueError("Invalid OTP")
    if _utc(museum["otp_expiry"]) < _now():
        raise ValueError("OTP expired")

    await db.museums.update_one(
        {"_id": ObjectId(museum_id)},
        {"$set": {"is_verified": True, "otp": None, "otp_expiry": None}}
    )
    return {"message": "Museum verified successfully"}

# ── login ─────────────────────────────────────────────────────────────────────

async def login(email: str, password: str) -> dict:
    db = get_db()
    museum = await db.museums.find_one({"email": email})

    if not museum:
        raise ValueError("Museum not found")
    if not museum.get("is_verified"):
        raise ValueError("Please verify your email first")
    if not verify_password(password, museum.get("password", "")):
        raise ValueError("Wrong password")

    mid = str(museum["_id"])

    # ← frontend reads res.data.accessToken
    return {
        "accessToken": create_access_token({"id": mid, "type": "museum"}),
        "refreshToken": create_refresh_token({"id": mid, "type": "museum"}),
        "museum": {
            "id": mid,
            "museumName": museum["museumName"],
            "email": museum["email"],
            "phone": museum["phone"],
            "location": museum["location"],
            "is_verified": museum["is_verified"]
        }
    }

# ── forgot password ───────────────────────────────────────────────────────────

async def forgot_password(email: str) -> dict:
    db = get_db()
    museum = await db.museums.find_one({"email": email})
    if not museum:
        raise ValueError("Museum not found")

    otp = generate_otp(4) 
    expiry = _now() + timedelta(minutes=5)

    await db.museums.update_one(
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
    museum = await db.museums.find_one({"email": email})

    if not museum:
        raise ValueError("Museum not found")
    if museum["reset_otp"] != otp:
        raise ValueError("Invalid OTP")
    if _utc(museum["reset_otp_expiry"]) < _now():
        raise ValueError("OTP expired")

    await db.museums.update_one(
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
    museum = await db.museums.find_one({"email": email})

    if not museum:
        raise ValueError("Museum not found")
    if not museum.get("reset_verified"):
        raise ValueError("OTP not verified")

    await db.museums.update_one(
        {"email": email},
        {"$set": {
            "password": hash_password(new_password),
            "reset_verified": False
        }}
    )
    return {"message": "Password reset successful"}

# ── get profile ───────────────────────────────────────────────────────────────

async def get_profile(museum_id: str) -> dict:
    db = get_db()
    museum = await db.museums.find_one(
        {"_id": ObjectId(museum_id)},
        {"password": 0}
    )
    if not museum:
        raise ValueError("Museum not found")
    return _serialize(museum)
from datetime import datetime, timezone
from bson import ObjectId
from app.db.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token
)
from app.core.logger import get_logger

logger = get_logger(__name__)

def _now():
    return datetime.now(timezone.utc)

def _serialize(admin: dict) -> dict:
    admin["id"] = str(admin.pop("_id"))
    return admin

# ── signup ────────────────────────────────────────────────────────────────────

async def signup(name: str, email: str, password: str, secret_key: str) -> dict:
    db = get_db()

    # ← Only people who know this key can register as admin
    if secret_key != settings.ADMIN_SECRET_KEY:
        raise ValueError("Invalid secret key")

    existing = await db.admins.find_one({"email": email})
    if existing:
        raise ValueError("Admin already exists")

    await db.admins.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "created_at": _now()
    })

    return {"message": "Admin registered successfully"}
# ── login ─────────────────────────────────────────────────────────────────────

async def login(email: str, password: str) -> dict:
    db = get_db()
    admin = await db.admins.find_one({"email": email})

    if not admin:
        raise ValueError("Admin not found")
    if not verify_password(password, admin.get("password", "")):
        raise ValueError("Wrong password")

    aid = str(admin["_id"])
    return {
        "accessToken": create_access_token({"id": aid, "type": "admin"}),
        "refreshToken": create_refresh_token({"id": aid, "type": "admin"}),
        "admin": {
            "id": aid,
            "name": admin["name"],
            "email": admin["email"]
        }
    }

# ── get profile ───────────────────────────────────────────────────────────────

async def get_profile(admin_id: str) -> dict:
    db = get_db()
    admin = await db.admins.find_one(
        {"_id": ObjectId(admin_id)},
        {"password": 0}
    )
    if not admin:
        raise ValueError("Admin not found")
    return _serialize(admin)
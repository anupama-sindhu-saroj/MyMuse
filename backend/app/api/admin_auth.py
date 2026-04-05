from fastapi import APIRouter, HTTPException, Depends
from app.schemas.admin_schema import AdminSignupRequest, AdminLoginRequest
from app.middleware.auth_middleware import get_current_user
import app.services.admin_service as admin_service

router = APIRouter()

@router.post("/signup")
async def signup(body: AdminSignupRequest):
    try:
        return await admin_service.signup(
            body.name, body.email, body.password, body.secret_key
        )
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/login")
async def login(body: AdminLoginRequest):
    try:
        return await admin_service.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.get("/profile")
async def get_profile(admin_id: str = Depends(get_current_user)):
    try:
        return await admin_service.get_profile(admin_id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
    
# Add this to app/api/admin_auth.py
# It adds GET /api/admin/museums — returns all registered museums for the sidebar

from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user


@router.get("/museums")
async def list_registered_museums(current_user: dict = Depends(get_current_user)):
    """
    Returns all museums that have signed up via museum_auth.
    Used by AdminDashboard sidebar to populate the museum selector.
    Fields returned match what frontend expects: museumName, location, id
    """
    db = get_db()
    cursor = db.museums.find(
        {"is_verified": True},
        {"password": 0, "otp": 0, "otp_expiry": 0,
         "reset_otp": 0, "reset_otp_expiry": 0}  # exclude sensitive fields
    ).sort("museumName", 1)

    museums = []
    async for m in cursor:
        museums.append({
            "id":          str(m["_id"]),
            "museumName":  m.get("museumName", ""),
            "email":       m.get("email", ""),
            "location":    m.get("location", ""),
            "phone":       m.get("phone", ""),
            "isProfileComplete": m.get("isProfileComplete", False),
            "created_at":  str(m.get("created_at", "")),
        })

    return {"museums": museums, "total": len(museums)}
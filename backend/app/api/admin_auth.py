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
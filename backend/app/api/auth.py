from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.user_schema import (
    SignupRequest, VerifyOTPRequest, LoginRequest,
    GoogleLoginRequest, ForgotPasswordRequest,
    VerifyResetOTPRequest, ResetPasswordRequest,
    RefreshTokenRequest
)
from app.middleware.auth_middleware import get_current_user
from fastapi import Depends
import app.services.user_service as user_service

router = APIRouter()

@router.post("/signup")
async def signup(body: SignupRequest):
    try:
        return await user_service.signup(body.name, body.email, body.password)
    except ValueError as e:
        print(f"SIGNUP ERROR: {e}")        # ← add this line
        raise HTTPException(400, detail=str(e))
    except Exception as e:
        print(f"SIGNUP UNEXPECTED ERROR: {e}")   # ← and this
        raise HTTPException(500, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    try:
        return await user_service.verify_otp(body.userId, body.otp)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/login")
async def login(body: LoginRequest):
    try:
        return await user_service.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/refresh")
async def refresh(body: RefreshTokenRequest):
    try:
        return await user_service.refresh_access_token(body.refresh_token)
    except ValueError as e:
        raise HTTPException(403, detail=str(e))

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    try:
        return await user_service.forgot_password(body.email)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyResetOTPRequest):
    try:
        return await user_service.verify_reset_otp(body.email, body.otp)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    try:
        return await user_service.reset_password(body.email, body.newPassword)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/google-login")
async def google_login(body: GoogleLoginRequest):
    try:
        return await user_service.google_login(body.token)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    try:
        return await user_service.get_profile(user_id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
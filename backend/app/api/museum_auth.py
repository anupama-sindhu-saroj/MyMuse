from fastapi import APIRouter, HTTPException, Depends
from app.schemas.museum_schema import (
    MuseumSignupRequest, MuseumVerifyOTPRequest,
    MuseumLoginRequest, MuseumForgotPasswordRequest,
    MuseumVerifyResetOTPRequest, MuseumResetPasswordRequest
)
from app.middleware.auth_middleware import get_current_user
import app.services.museum_service as museum_service

router = APIRouter()

@router.post("/signup")
async def signup(body: MuseumSignupRequest):
    try:
        return await museum_service.signup(body.model_dump())
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(body: MuseumVerifyOTPRequest):
    try:
        return await museum_service.verify_otp(body.museumId, body.otp)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/login")
async def login(body: MuseumLoginRequest):
    try:
        return await museum_service.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/forgot-password")
async def forgot_password(body: MuseumForgotPasswordRequest):
    try:
        return await museum_service.forgot_password(body.email)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/verify-reset-otp")
async def verify_reset_otp(body: MuseumVerifyResetOTPRequest):
    try:
        return await museum_service.verify_reset_otp(body.email, body.otp)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.post("/reset-password")
async def reset_password(body: MuseumResetPasswordRequest):
    try:
        return await museum_service.reset_password(body.email, body.newPassword)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

@router.get("/profile")
async def get_profile(museum_id: str = Depends(get_current_user)):
    try:
        return await museum_service.get_profile(museum_id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
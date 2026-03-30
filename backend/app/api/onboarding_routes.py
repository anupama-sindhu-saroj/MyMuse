from fastapi import APIRouter, Depends
from app.schemas.onboarding_schema import MuseumOnboardingRequest
from app.services.onboarding_service import complete_onboarding
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/museums", tags=["Museum Onboarding"])

@router.put("/onboarding")
async def onboarding(
    data: MuseumOnboardingRequest,
    museum_id: str = Depends(get_current_user)
):
    return await complete_onboarding(museum_id, data.dict())
from fastapi import APIRouter, Depends, HTTPException, Query
from app.agents.analytics.analytics_agent import run_analytics_agent, run_platform_analytics
from app.middleware.auth_middleware import get_current_user as get_current_admin_user
from bson import ObjectId
 
router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
 
 
@router.get("/museum/{museum_id}")
async def get_museum_analytics(
    museum_id: str,
    days: int = Query(default=30, ge=1, le=365),
    current_user=Depends(get_current_admin_user)
):
    """
    Returns analytics for ONE specific museum.
    All data is filtered by museum_id — completely isolated.
    """
    try:
        result = await run_analytics_agent(museum_id=museum_id, days=days)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/platform")
async def get_platform_analytics(
    days: int = Query(default=30, ge=1, le=365),
    current_user=Depends(get_current_admin_user)
):
    """
    Returns aggregated analytics across ALL museums.
    Used on the admin overview page only.
    """
    try:
        result = await run_platform_analytics(days=days)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
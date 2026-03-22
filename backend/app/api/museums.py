from fastapi import APIRouter, Query
from typing import Optional
from app.db.database import get_db

router = APIRouter()


@router.get("/api/museums")
async def list_museums(
    city: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    db = get_db()
    query = {"is_active": True}

    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"state": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.museums.find(query).skip(skip).limit(limit)
    museums = []
    async for m in cursor:
        m["id"] = str(m["_id"])
        del m["_id"]
        museums.append(m)

    total = await db.museums.count_documents(query)

    return {"museums": museums, "total": total}


@router.get("/api/museums/{museum_id}")
async def get_museum(museum_id: str):
    from bson import ObjectId
    db = get_db()
    museum = await db.museums.find_one({"_id": ObjectId(museum_id)})
    if not museum:
        from fastapi import HTTPException
        raise HTTPException(404, "Museum not found")
    museum["id"] = str(museum["_id"])
    del museum["_id"]
    return museum


@router.get("/api/museums/search/by-city")
async def museums_by_city():
    """Returns list of all cities that have museums."""
    db = get_db()
    cities = await db.museums.distinct("city")
    return {"cities": sorted(cities)}
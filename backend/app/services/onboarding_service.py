from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from app.db.database import get_db
from app.utils.encryption import encrypt

async def complete_onboarding(museum_id: str, data: dict):
    db = get_db()

    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        object_id = ObjectId(museum_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid museum ID")

    update_data = {
        "license": data.get("license"),
        "accountHolder": data.get("accountHolder"),
        "routingNumber": encrypt(data.get("routingNumber", "")),
        "accountNumber": encrypt(data.get("accountNumber", "")),
        "isProfileComplete": True
    }

    update_data = {k: v for k, v in update_data.items() if v is not None}

    result = await db["museums"].update_one(
        {"_id": object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Museum not found")

    return {"message": "Onboarding completed successfully"}
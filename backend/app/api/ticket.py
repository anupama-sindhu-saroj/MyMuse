from fastapi import APIRouter
from app.db.database import get_db

router = APIRouter()

@router.get("/verify")
async def verify_ticket(ticket_id: str):
    db = get_db()
    booking = await db["bookings"].find_one({"ticket_id": ticket_id})
    if not booking:
        return {"valid": False}
    return {
        "valid": True,
        "show_name": booking.get("show_name"),
        "museum_name": booking.get("museum_name"),
        "visit_date": booking.get("visit_date"),
        "time_slot": booking.get("time_slot"),
    }
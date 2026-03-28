from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
from bson import ObjectId
from app.db.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


class BookingRequest(BaseModel):
    show_id: Optional[str] = None
    show_name: str
    museum_name: Optional[str] = None
    visit_date: str
    time_slot: str
    tickets: Dict[str, int]
    total_amount: int


class BookingResponse(BaseModel):
    booking_id: str
    message: str


@router.post("/api/bookings/create", response_model=BookingResponse)
async def create_booking(
    data: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    booking = {
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "user_name": current_user.get("name", ""),
        "show_name": data.show_name,
        "museum_name": data.museum_name or "National Heritage Museum",
        "visit_date": data.visit_date,
        "time_slot": data.time_slot,
        "tickets": data.tickets,
        "total_amount": data.total_amount,
        "status": "pending_payment",
        "payment_status": "pending",
        "created_at": datetime.utcnow()
    }

    result = await db.bookings.insert_one(booking)
    booking_id = str(result.inserted_id)
    logger.info(f"Booking created: {booking_id} for user {current_user['email']}")

    return BookingResponse(
        booking_id=booking_id,
        message="Booking created. Proceed to payment."
    )


@router.get("/api/bookings/my")
async def my_bookings(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.bookings.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1)

    bookings = []
    async for b in cursor:
        b["id"] = str(b["_id"])
        del b["_id"]
        bookings.append(b)

    return {
        "bookings": bookings,
        "total": len(bookings),
        "paid": len([b for b in bookings if b["payment_status"] == "paid"])
    }


@router.get("/api/bookings/upcoming")
async def upcoming_booking(current_user: dict = Depends(get_current_user)):
    db = get_db()
    today = datetime.utcnow().strftime("%Y-%m-%d")
    booking = await db.bookings.find_one(
        {
            "user_id": current_user["id"],
            "visit_date": {"$gte": today},
            "payment_status": "paid"
        },
        sort=[("visit_date", 1)]
    )
    if booking:
        booking["id"] = str(booking["_id"])
        del booking["_id"]
    return {"booking": booking}


@router.get("/api/bookings/{booking_id}")
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking["user_id"] != current_user["id"]:
        raise HTTPException(403, "Not your booking")
    booking["id"] = str(booking["_id"])
    del booking["_id"]
    return booking

class FinalizeBookingRequest(BaseModel):
    session_id: str


@router.post("/api/bookings/finalize")
async def finalize_booking(
    data: FinalizeBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    from app.agents.booking.booking_agent import get_session, delete_session, save_booking_to_db

    booking = await get_session(data.session_id)

    if not booking:
        raise HTTPException(400, "No active booking session")

    booking_id = await save_booking_to_db(booking, current_user["id"])

    await delete_session(data.session_id)

    return {
        "booking_id": booking_id,
        "message": "Booking confirmed. Redirecting to payment."
    }
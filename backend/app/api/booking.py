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


# -------------------- MODELS --------------------

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


class FinalizeBookingRequest(BaseModel):
    session_id: str


# -------------------- CREATE BOOKING --------------------

@router.post("/create", response_model=BookingResponse)
async def create_booking(
    data: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    booking = {
        "user_id": str(current_user["id"]),    # ✅ always store as string
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
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.bookings.insert_one(booking)
    booking_id = str(result.inserted_id)

    logger.info(f"Booking created: {booking_id} for user {current_user['email']}")

    return BookingResponse(
        booking_id=booking_id,
        message="Booking created. Proceed to payment."
    )


# -------------------- MY BOOKINGS --------------------

@router.get("/my")
async def my_bookings(current_user: dict = Depends(get_current_user)):
    db = get_db()

    cursor = db.bookings.find(
        {"user_id": str(current_user["id"])}    # ✅ match as string
    ).sort("created_at", -1)

    bookings = []
    async for b in cursor:
        b["id"] = str(b["_id"])
        del b["_id"]
        # ✅ serialize any ObjectId values left in the document
        for key, val in b.items():
            if isinstance(val, ObjectId):
                b[key] = str(val)
        bookings.append(b)

    paid_count = len([
        b for b in bookings
        if b.get("payment_status") == "paid"
    ])

    return {
        "bookings": bookings,
        "total": len(bookings),
        "paid": paid_count,
    }


# -------------------- UPCOMING BOOKING --------------------

@router.get("/upcoming")
async def upcoming_booking(current_user: dict = Depends(get_current_user)):
    db = get_db()

    today = datetime.utcnow().strftime("%Y-%m-%d")

    booking = await db.bookings.find_one(
        {
            "user_id": str(current_user["id"]),  # ✅ match as string
            "visit_date": {"$gte": today},
            "payment_status": "paid",
        },
        sort=[("visit_date", 1)]
    )

    if booking:
        booking["id"] = str(booking["_id"])
        del booking["_id"]
        for key, val in booking.items():
            if isinstance(val, ObjectId):
                booking[key] = str(val)

    return {"booking": booking}


# -------------------- GET SINGLE BOOKING --------------------

@router.get("/{booking_id}")
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if str(booking["user_id"]) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not your booking")

    booking["id"] = str(booking["_id"])
    del booking["_id"]
    for key, val in booking.items():
        if isinstance(val, ObjectId):
            booking[key] = str(val)

    return booking

# -------------------- CANCEL BOOKING --------------------


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()

    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if str(booking["user_id"]) != str(current_user["id"]):
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.get("payment_status") != "paid":
        raise HTTPException(status_code=400, detail="Only paid bookings can be cancelled")

    if booking.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Booking already cancelled")

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "status": "cancelled",
            "payment_status": "cancelled",
            "cancelled_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )

    return {"success": True, "message": "Booking cancelled successfully"}
# -------------------- FINALIZE BOOKING --------------------

@router.post("/finalize")
async def finalize_booking(
    data: FinalizeBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    from app.agents.booking.booking_agent import (
        get_session,
        delete_session,
        save_booking_to_db,
    )

    booking = await get_session(data.session_id)

    if not booking:
        raise HTTPException(status_code=400, detail="No active booking session")

    booking_id = await save_booking_to_db(booking, str(current_user["id"]))

    await delete_session(data.session_id)

    return {
        "booking_id": booking_id,
        "message": "Booking confirmed. Redirecting to payment."
    }
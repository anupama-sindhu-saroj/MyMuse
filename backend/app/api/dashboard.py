import base64
import traceback
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.db.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def serialize_booking(booking: dict) -> dict:
    """Safely serialize a MongoDB booking document for JSON response."""
    booking = dict(booking)

    if "_id" in booking:
        booking["_id"] = str(booking["_id"])

    # Serialize all ObjectId fields
    for key, val in booking.items():
        if isinstance(val, ObjectId):
            booking[key] = str(val)

    # qr_code is stored as base64 string in your payment.py (generate_qr returns base64)
    # so no bytes conversion needed — but handle bytes just in case
    if isinstance(booking.get("qr_code"), bytes):
        booking["qr_code"] = base64.b64encode(booking["qr_code"]).decode("utf-8")

    # Serialize datetime fields
    for field in ["created_at", "updated_at", "paid_at"]:
        if isinstance(booking.get(field), datetime):
            booking[field] = booking[field].isoformat()

    return booking


@router.get("/debug/{user_id}")
async def debug_dashboard(user_id: str):
    """Temporary debug route — remove before production"""
    db = get_db()
    all_bookings = await db.bookings.find({}).to_list(length=50)
    result = []
    for b in all_bookings:
        result.append({
            "_id": str(b.get("_id")),
            "user_id": str(b.get("user_id", "MISSING")),
            "user_id_type": type(b.get("user_id")).__name__,
            "payment_status": b.get("payment_status", "MISSING"),
            "status": b.get("status", "MISSING"),
            "museum_name": b.get("museum_name"),
            "visit_date": b.get("visit_date"),
        })
    return {
        "queried_user_id": user_id,
        "total_bookings_in_db": len(result),
        "bookings": result,
    }


@router.get("/user/{user_id}")
async def get_user_dashboard(user_id: str):
    try:
        db = get_db()

        # ✅ user_id is always stored as string (fixed in booking.py)
        # But also try ObjectId match for any older bookings saved before the fix
        query_conditions = [{"user_id": user_id}]
        try:
            query_conditions.append({"user_id": ObjectId(user_id)})
        except Exception:
            pass

        bookings = await db.bookings.find(
            {"$or": query_conditions}
        ).to_list(length=None)

        print(f"[Dashboard] Found {len(bookings)} total bookings for user_id={user_id}")

        if not bookings:
            return {
                "ticketsBooked": 0,
                "museumsVisited": 0,
                "upcomingCount": 0,
                "currentBooking": None,
            }

        # ✅ payment_status is now always set to "paid" by payment/verify
        PAID_STATUSES = {"paid", "confirmed", "success", "completed"}
        paid_bookings = [
            b for b in bookings
            if str(b.get("payment_status", "")).lower() in PAID_STATUSES
        ]

        print(f"[Dashboard] Paid: {len(paid_bookings)} | Statuses: {[b.get('payment_status') for b in bookings]}")

        tickets_booked = len(paid_bookings)

        museums_visited = len({
            b.get("museum_name")
            for b in paid_bookings
            if b.get("museum_name")
        })

        today = datetime.utcnow().date()
        upcoming_count = 0
        for b in paid_bookings:
            try:
                visit_date_str = b.get("visit_date")
                if visit_date_str:
                    visit_date = datetime.strptime(
                        str(visit_date_str), "%Y-%m-%d"
                    ).date()
                    if visit_date >= today:
                        upcoming_count += 1
            except ValueError:
                continue

        current_booking = None
        if paid_bookings:
            latest = sorted(
                paid_bookings,
                key=lambda x: x.get("created_at", datetime.min),
                reverse=True,
            )[0]
            current_booking = serialize_booking(latest)

        return {
            "ticketsBooked": tickets_booked,
            "museumsVisited": museums_visited,
            "upcomingCount": upcoming_count,
            "currentBooking": current_booking,
        }

    except RuntimeError as e:
        print("DASHBOARD DB ERROR:", str(e))
        raise HTTPException(status_code=503, detail="Database not available")

    except Exception as e:
        print("DASHBOARD ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
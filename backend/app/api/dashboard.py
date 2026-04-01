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


def get_query_conditions(user_id: str) -> list:
    """Build query conditions to match user_id as string or ObjectId."""
    conditions = [{"user_id": user_id}]
    try:
        conditions.append({"user_id": ObjectId(user_id)})
    except Exception:
        pass
    return conditions


PAID_STATUSES = {"paid", "confirmed", "success", "completed"}


def is_paid(booking: dict) -> bool:
    return str(booking.get("payment_status", "")).lower() in PAID_STATUSES


def parse_visit_date(booking: dict):
    """Returns a date object or None."""
    try:
        visit_date_str = booking.get("visit_date")
        if visit_date_str:
            return datetime.strptime(str(visit_date_str), "%Y-%m-%d").date()
    except ValueError:
        pass
    return None


# ─────────────────────────────────────────────
# DEBUG ROUTE
# ─────────────────────────────────────────────

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


# ─────────────────────────────────────────────
# SUMMARY ROUTE  (existing, unchanged logic)
# ─────────────────────────────────────────────

@router.get("/user/{user_id}")
async def get_user_dashboard(user_id: str):
    try:
        db = get_db()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        print(f"[Dashboard] Found {len(bookings)} total bookings for user_id={user_id}")

        if not bookings:
            return {
                "ticketsBooked": 0,
                "museumsVisited": 0,
                "upcomingCount": 0,
                "currentBooking": None,
            }

        paid_bookings = [b for b in bookings if is_paid(b)]

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
            visit_date = parse_visit_date(b)
            if visit_date and visit_date > today:        # strictly after today
                upcoming_count += 1

        # Count visited (visit_date <= today)
        visited_count = 0
        for b in paid_bookings:
            visit_date = parse_visit_date(b)
            if visit_date and visit_date <= today:       # today counts as visited
                visited_count += 1

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
            "visitedCount": visited_count,
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


# ─────────────────────────────────────────────
# ALL TICKETS  →  GET /api/dashboard/user/{user_id}/tickets
# ─────────────────────────────────────────────

@router.get("/user/{user_id}/tickets")
async def get_all_tickets(user_id: str):
    """
    Returns all paid bookings for the user.
    Called when the user clicks on 'Tickets Booked'.
    """
    try:
        db = get_db()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        paid_bookings = [b for b in bookings if is_paid(b)]

        # Sort newest first
        paid_bookings.sort(
            key=lambda x: x.get("created_at", datetime.min), reverse=True
        )

        return {
            "total": len(paid_bookings),
            "tickets": [serialize_booking(b) for b in paid_bookings],
        }

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Database not available")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ─────────────────────────────────────────────
# VISITED TICKETS  →  GET /api/dashboard/user/{user_id}/visited
# ─────────────────────────────────────────────

@router.get("/user/{user_id}/visited")
async def get_visited_tickets(user_id: str):
    """
    Returns paid bookings where visit_date is strictly before today.
    Called when the user clicks on 'Museums Visited'.
    """
    try:
        db = get_db()
        today = datetime.utcnow().date()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        visited = []
        for b in bookings:
            if not is_paid(b):
                continue
            visit_date = parse_visit_date(b)
            if visit_date and visit_date <= today:      # today counts as visited
                visited.append(b)

        # Sort by visit_date descending (most recently visited first)
        visited.sort(
            key=lambda x: parse_visit_date(x) or datetime.min.date(), reverse=True
        )

        return {
            "total": len(visited),
            "tickets": [serialize_booking(b) for b in visited],
        }

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Database not available")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ─────────────────────────────────────────────
# UPCOMING TICKETS  →  GET /api/dashboard/user/{user_id}/upcoming
# ─────────────────────────────────────────────

@router.get("/user/{user_id}/upcoming")
async def get_upcoming_tickets(user_id: str):
    """
    Returns paid bookings where visit_date >= today.
    Called when the user clicks on 'Upcoming'.
    """
    try:
        db = get_db()
        today = datetime.utcnow().date()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        upcoming = []
        for b in bookings:
            if not is_paid(b):
                continue
            visit_date = parse_visit_date(b)
            if visit_date and visit_date > today:       # strictly after today
                upcoming.append(b)

        # Sort by visit_date ascending (soonest first)
        upcoming.sort(
            key=lambda x: parse_visit_date(x) or datetime.max.date()
        )

        return {
            "total": len(upcoming),
            "tickets": [serialize_booking(b) for b in upcoming],
        }

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail="Database not available")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
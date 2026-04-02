import base64
import traceback
from datetime import datetime, timezone, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.db.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# ✅ IST = UTC+5:30
IST = timezone(timedelta(hours=5, minutes=30))


def get_today_ist():
    """Returns today's date in IST (India Standard Time)."""
    return datetime.now(IST).date()


def serialize_booking(booking: dict) -> dict:
    """Safely serialize a MongoDB booking document for JSON response."""
    booking = dict(booking)

    if "_id" in booking:
        booking["_id"] = str(booking["_id"])

    for key, val in booking.items():
        if isinstance(val, ObjectId):
            booking[key] = str(val)

    if isinstance(booking.get("qr_code"), bytes):
        booking["qr_code"] = base64.b64encode(booking["qr_code"]).decode("utf-8")

    for field in ["created_at", "updated_at", "paid_at"]:
        if isinstance(booking.get(field), datetime):
            booking[field] = booking[field].isoformat()

    return booking


def get_query_conditions(user_id: str) -> list:
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
    db = get_db()
    today_ist = get_today_ist()
    all_bookings = await db.bookings.find({}).to_list(length=50)
    result = []
    for b in all_bookings:
        vd = parse_visit_date(b)
        result.append({
            "_id": str(b.get("_id")),
            "user_id": str(b.get("user_id", "MISSING")),
            "payment_status": b.get("payment_status", "MISSING"),
            "museum_name": b.get("museum_name"),
            "visit_date": b.get("visit_date"),
            "visit_date_parsed": str(vd) if vd else None,
            # ✅ today <= today → visited
            "category": (
                "upcoming" if vd and vd > today_ist else
                "visited"  if vd and vd <= today_ist else
                "no_date"
            ),
        })
    return {
        "queried_user_id": user_id,
        "today_ist": str(today_ist),
        "total_bookings_in_db": len(result),
        "bookings": result,
    }


# ─────────────────────────────────────────────
# SUMMARY ROUTE
# ─────────────────────────────────────────────

@router.get("/user/{user_id}")
async def get_user_dashboard(user_id: str):
    try:
        db = get_db()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        if not bookings:
            return {
                "ticketsBooked": 0,
                "visitedCount": 0,
                "upcomingCount": 0,
                "currentBooking": None,
            }

        paid_bookings = [b for b in bookings if is_paid(b)]

        today = get_today_ist()  # ✅ IST date

        visited_list  = []
        upcoming_list = []

        for b in paid_bookings:
            visit_date = parse_visit_date(b)
            if visit_date is None:
                upcoming_list.append(b)        # no date → upcoming
            elif visit_date <= today:
                visited_list.append(b)         # ✅ today OR past → visited
            else:
                upcoming_list.append(b)        # ✅ strictly future → upcoming

        visited_count  = len(visited_list)
        upcoming_count = len(upcoming_list)
        tickets_booked = visited_count + upcoming_count  # always equal to len(paid_bookings)

        print(f"[Dashboard] today_IST={today} | visited={visited_count} | upcoming={upcoming_count} | total={tickets_booked}")

        current_booking = None
        if paid_bookings:
            latest = sorted(
                paid_bookings,
                key=lambda x: x.get("created_at", datetime.min),
                reverse=True,
            )[0]
            current_booking = serialize_booking(latest)

        return {
            "ticketsBooked": tickets_booked,   # ✅ visited + upcoming
            "visitedCount":  visited_count,    # ✅ visit_date <= today (IST)
            "upcomingCount": upcoming_count,   # ✅ visit_date > today (IST)
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
    """Returns ALL paid bookings = visited + upcoming."""
    try:
        db = get_db()
        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        paid_bookings = [b for b in bookings if is_paid(b)]
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
    ✅ visit_date <= today (IST)
    TODAY counts as visited. Past dates also visited.
    """
    try:
        db = get_db()
        today = get_today_ist()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        visited = []
        for b in bookings:
            if not is_paid(b):
                continue
            visit_date = parse_visit_date(b)
            if visit_date and visit_date <= today:   # ✅ today + past
                visited.append(b)

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
    ✅ visit_date > today (IST)
    STRICTLY future only. Today is NOT upcoming.
    """
    try:
        db = get_db()
        today = get_today_ist()

        bookings = await db.bookings.find(
            {"$or": get_query_conditions(user_id)}
        ).to_list(length=None)

        upcoming = []
        for b in bookings:
            if not is_paid(b):
                continue
            visit_date = parse_visit_date(b)
            if visit_date and visit_date > today:    # ✅ strictly future
                upcoming.append(b)

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
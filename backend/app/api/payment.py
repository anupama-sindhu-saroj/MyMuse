from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.core.security import decode_access_token
from app.agents.payment.payment_chain import run_payment_chain
from app.agents.payment.razorpay_service import create_order, verify_payment
from app.agents.payment.qr_generator import generate_qr
from app.db.database import get_db
from bson import ObjectId
from datetime import datetime
import asyncio

router = APIRouter()
bearer_scheme = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ─── Schemas ──────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    booking_id: str


class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ─── GET /api/payment/summary ─────────────────────────────

@router.get("/summary")
async def get_payment_summary(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        booking = await db["bookings"].find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "booking_id": booking_id,
        "show_name": booking.get("show_name"),
        "museum_name": booking.get("museum_name"),
        "visit_date": booking.get("visit_date"),
        "time_slot": booking.get("time_slot"),
        "tickets": booking.get("tickets", {}),
        "amount": booking.get("total_amount", 0) * 100  # paise
    }


# ─── POST /api/payment/create ─────────────────────────────

@router.post("/create")
async def create_payment_order(
    body: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        booking = await db["bookings"].find_one({"_id": ObjectId(body.booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    amount = booking.get("total_amount", 0)
    booking_id = str(booking["_id"])

    order = await asyncio.get_event_loop().run_in_executor(
        None, lambda: create_order(amount=amount, booking_id=booking_id)
    )

    return {
        "order_id": order["id"],
        "amount": amount * 100,
        "booking_id": booking_id,
        "show_name": booking.get("show_name"),
        "museum_name": booking.get("museum_name"),
        "visit_date": booking.get("visit_date"),
        "time_slot": booking.get("time_slot"),
        "tickets": booking.get("tickets"),
    }


# ─── POST /api/payment/verify ─────────────────────────────

@router.post("/verify")
async def verify_payment_endpoint(
    body: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Verify Razorpay signature
    is_valid = await asyncio.get_event_loop().run_in_executor(
        None, lambda: verify_payment(
            body.razorpay_order_id,
            body.razorpay_payment_id,
            body.razorpay_signature
        )
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # 2. Fetch booking
    try:
        booking = await db["bookings"].find_one({"_id": ObjectId(body.booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 3. If already paid, return existing ticket data without reprocessing
    if booking.get("payment_status") == "paid":
        return {
            "success": True,
            "ticket_id": booking.get("ticket_id"),
            "qr_code": booking.get("qr_code"),
            "museum_name": booking.get("museum_name"),
            "show_name": booking.get("show_name"),
            "visit_date": booking.get("visit_date"),
            "time_slot": booking.get("time_slot"),
            "tickets": booking.get("tickets"),
            "total_amount": booking.get("total_amount"),
            "payment_id": booking.get("payment_id"),
        }

    # 4. Generate QR code
    ticket_id = f"MUSEO-{body.razorpay_payment_id[-6:].upper()}"
    user_name = current_user.get("name") or current_user.get("email") or "Guest"
    qr_base64 = generate_qr(
        booking_id=ticket_id,
        user_name=user_name,
        show_name=booking.get("show_name", "Museum Visit"),
        date=booking.get("visit_date", "")
    )

    # 5. ✅ THE FIX: update BOTH status AND payment_status to confirmed/paid
    await db["bookings"].update_one(
        {"_id": ObjectId(body.booking_id)},
        {
            "$set": {
                "status": "confirmed",
                "payment_status": "paid",          # ← THIS WAS MISSING
                "confirmed": True,
                "payment_id": body.razorpay_payment_id,
                "order_id": body.razorpay_order_id,
                "ticket_id": ticket_id,
                "qr_code": qr_base64,
                "paid_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        }
    )

    # 6. Return ticket data to frontend
    return {
        "success": True,
        "ticket_id": ticket_id,
        "qr_code": qr_base64,
        "museum_name": booking.get("museum_name"),
        "show_name": booking.get("show_name"),
        "visit_date": booking.get("visit_date"),
        "time_slot": booking.get("time_slot"),
        "tickets": booking.get("tickets"),
        "total_amount": booking.get("total_amount"),
        "payment_id": body.razorpay_payment_id,
    }


@router.post("/recommend-method")
async def recommend_method(body: dict):
    amount = body.get("amount", 0)
    user_message = body.get("user_message", "")

    response = await run_payment_chain(
        booking_details=f"Amount: ₹{amount}, Platform: India, Time: {datetime.utcnow().strftime('%H:%M')}",
        payment_status="Awaiting payment method recommendation",
        chat_history="",
        user_message=user_message
    )

    # ✅ Gemini decides — we just detect its recommendation
    response_lower = (response or "").lower()
    if "net banking" in response_lower or "netbanking" in response_lower:
        method = "netbanking"
    elif "card" in response_lower or "credit" in response_lower or "debit" in response_lower:
        method = "card"
    else:
        method = "upi"

    return {
        "recommended_method": method,
        "message": response
    }


# ─── POST /api/payment/analyze-failure ────────────────────

@router.post("/analyze-failure")
async def analyze_failure(body: dict):
    failed_method = body.get("method", "upi")
    reason = body.get("reason", "Payment failed")
    suggested = "card" if failed_method == "upi" else "upi"
    success_rates = {"card": "91%", "upi": "87%", "netbanking": "82%"}

    response = await run_payment_chain(
        booking_details="",
        payment_status=f"Payment failed via {failed_method}. Reason: {reason}",
        chat_history="",
        user_message="What should I do now?"
    )

    return {
        "message": response or f"{failed_method} failed. Try {suggested}.",
        "suggested_method": suggested,
        "success_rate": success_rates.get(suggested, "85%")
    }
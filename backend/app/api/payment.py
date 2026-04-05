from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.core.security import decode_access_token
from app.agents.payment.payment_chain import run_payment_chain
from app.agents.payment.razorpay_service import create_order, verify_payment
from app.agents.payment.qr_generator import generate_qr
from app.db.database import get_db
from app.api.ticket_pdf import generate_ticket_pdf
from app.api.email_service import send_ticket_email
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


class CreateOrderRequest(BaseModel):
    booking_id: str


class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ─── Helper: fetch user email/name from DB using token's id ───────────────────
async def _get_user_info(current_user: dict) -> tuple:
    """Returns (email, name) by fetching user from DB using id from token."""
    try:
        db = get_db()
        user_id = current_user.get("id") or current_user.get("sub") or ""
        if not user_id:
            return "", "Guest"
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            email = user.get("email", "")
            name  = user.get("name", "") or user.get("username", "") or email
            return email, name
    except Exception as e:
        print(f"[payment] ⚠️ Could not fetch user from DB: {e}")
    return "", "Guest"


# ─── Helper: send ticket email safely ────────────────────────────────────────
async def _send_email(booking: dict, current_user: dict, ticket_id: str):
    try:
        # ✅ Always fetch email/name from DB — token doesn't have them
        user_email, user_name = await _get_user_info(current_user)

        if not user_email:
            print("[payment] ⚠️ No email found for user, skipping email")
            return

        print(f"[payment] 📧 Sending ticket to {user_email}...")
        booking["ticket_id"]  = ticket_id
        booking["user_name"]  = user_name
        booking["user_email"] = user_email

        pdf_bytes = generate_ticket_pdf(booking)
        send_ticket_email(
            to_email=user_email,
            user_name=user_name,
            booking=booking,
            pdf_bytes=pdf_bytes,
        )
    except Exception as e:
        print(f"[payment] ⚠️ Email sending failed (non-fatal): {e}")


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
<<<<<<< HEAD
    museum = await db["museums"].find_one(
        {"museumName": booking.get("museum_name")},
        {"image_url": 1}
    )
    image_url = museum.get("image_url") if museum else None

=======
>>>>>>> 32119445995e0d01e108b0004d0a9fa05b8ea8d1
    return {
        "booking_id": booking_id,
        "show_name": booking.get("show_name"),
        "museum_name": booking.get("museum_name"),
        "visit_date": booking.get("visit_date"),
        "time_slot": booking.get("time_slot"),
        "tickets": booking.get("tickets", {}),
<<<<<<< HEAD
        "amount": booking.get("total_amount", 0) * 100,  # paise
        "image_url": image_url
=======
        "amount": booking.get("total_amount", 0) * 100
>>>>>>> 32119445995e0d01e108b0004d0a9fa05b8ea8d1
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
    amount     = booking.get("total_amount", 0)
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

    # 3. Already paid — send email if not sent yet, then return
    if booking.get("payment_status") == "paid":
        ticket_id = booking.get("ticket_id", "")
        if not booking.get("email_sent"):
            await _send_email(booking, current_user, ticket_id)
            await db["bookings"].update_one(
                {"_id": ObjectId(body.booking_id)},
                {"$set": {"email_sent": True}}
            )
        return {
            "success": True,
            "ticket_id": ticket_id,
            "qr_code": booking.get("qr_code"),
            "museum_name": booking.get("museum_name"),
            "show_name": booking.get("show_name"),
            "visit_date": booking.get("visit_date"),
            "time_slot": booking.get("time_slot"),
            "tickets": booking.get("tickets"),
            "total_amount": booking.get("total_amount"),
            "payment_id": booking.get("payment_id"),
        }

    # 4. Generate ticket_id and QR
    ticket_id = f"MUSEO-{body.razorpay_payment_id[-6:].upper()}"
    user_name = (await _get_user_info(current_user))[1]
    qr_base64 = generate_qr(
        booking_id=ticket_id,
        user_name=user_name,
        show_name=booking.get("show_name", "Museum Visit"),
        date=booking.get("visit_date", "")
    )

    # 5. Update booking in DB
    await db["bookings"].update_one(
        {"_id": ObjectId(body.booking_id)},
        {"$set": {
            "status": "confirmed",
            "payment_status": "paid",
            "confirmed": True,
            "payment_id": body.razorpay_payment_id,
            "order_id": body.razorpay_order_id,
            "ticket_id": ticket_id,
            "qr_code": qr_base64,
            "email_sent": True,
            "paid_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }}
    )

    # 6. ✅ Send ticket PDF to logged-in user's email
    await _send_email(booking, current_user, ticket_id)

    # 7. Return ticket data to frontend
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
<<<<<<< HEAD
    fallback_method = "card" if amount > 5000 else "upi"
    fallback_msg = f"{'Card recommended' if amount > 5000 else 'UPI is fastest'} for ₹{amount}."

    try:
        response = await run_payment_chain(
            booking_details=f"Amount: ₹{amount}, Platform: India, Time: {datetime.utcnow().strftime('%H:%M')}",
            payment_status="Awaiting payment method recommendation",
            chat_history="",
            user_message=body.get("user_message", "")
        )
        response_lower = (response or "").lower()

        # ✅ UPI checked first to avoid false "card" keyword matches
        if "upi" in response_lower or "google pay" in response_lower or "phonepe" in response_lower:
            method = "upi"
        elif "net banking" in response_lower or "netbanking" in response_lower:
            method = "netbanking"
        elif "card" in response_lower or "credit" in response_lower or "debit" in response_lower:
            method = "card"
        else:
            method = fallback_method

        message = response or fallback_msg

    except Exception:
        method = fallback_method
        message = fallback_msg

    return {"recommended_method": method, "message": message}

=======
    user_message = body.get("user_message", "")
    response = await run_payment_chain(
        booking_details=f"Amount: ₹{amount}, Platform: India, Time: {datetime.utcnow().strftime('%H:%M')}",
        payment_status="Awaiting payment method recommendation",
        chat_history="",
        user_message=user_message
    )
    response_lower = (response or "").lower()
    if "net banking" in response_lower or "netbanking" in response_lower:
        method = "netbanking"
    elif "card" in response_lower or "credit" in response_lower or "debit" in response_lower:
        method = "card"
    else:
        method = "upi"
    return {"recommended_method": method, "message": response}

>>>>>>> 32119445995e0d01e108b0004d0a9fa05b8ea8d1

@router.post("/analyze-failure")
async def analyze_failure(body: dict):
    failed_method = body.get("method", "upi")
    reason = body.get("reason", "Payment failed")
    suggested = "card" if failed_method == "upi" else "upi"
    success_rates = {"card": "91%", "upi": "87%", "netbanking": "82%"}
<<<<<<< HEAD
    fallback_msg = f"{failed_method} failed. Try {suggested} instead."

    try:
        response = await run_payment_chain(
            booking_details="",
            payment_status=f"Payment failed via {failed_method}. Reason: {reason}",
            chat_history="",
            user_message="What should I do now?"
        )
        message = response or fallback_msg
    except Exception:
        message = fallback_msg  # ✅ won't crash on Gemini quota

=======
    response = await run_payment_chain(
        booking_details="",
        payment_status=f"Payment failed via {failed_method}. Reason: {reason}",
        chat_history="",
        user_message="What should I do now?"
    )
>>>>>>> 32119445995e0d01e108b0004d0a9fa05b8ea8d1
    return {
        "message": message,
        "suggested_method": suggested,
        "success_rate": success_rates.get(suggested, "85%")
    }
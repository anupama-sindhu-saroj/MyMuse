import asyncio
from bson import ObjectId
from app.agents.payment.razorpay_service import verify_payment
from app.agents.payment.qr_generator import generate_qr
from app.db.database import get_db


async def confirm_payment_and_generate_qr(
    booking_id: str,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> dict:

    # ✅ FIX 1: fetch db here (was missing, caused NameError)
    db = get_db()
    if db is None:
        return {"success": False, "message": "Database not connected"}

    is_valid = await asyncio.get_event_loop().run_in_executor(
        None, lambda: verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    )

    if not is_valid:
        return {"success": False, "message": "Payment verification failed"}

    await db["bookings"].update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "status": "confirmed",
            "confirmed": True,
            "payment_id": razorpay_payment_id
        }}
    )

    booking = await db["bookings"].find_one({"_id": ObjectId(booking_id)})

    if not booking:
        return {"success": False, "message": "Booking not found after payment"}

    tickets = booking.get("tickets", {})
    ticket_summary = f"Adult x{tickets.get('adult', 0)}, Child x{tickets.get('child', 0)}"

    qr_base64 = generate_qr(
        booking_id=booking_id,
        user_name=booking.get("user_name", "Guest"),
        show_name=booking.get("show_name", "Museum Visit"),
        date=booking.get("visit_date", "")
    )

    await db["tickets"].insert_one({
        "booking_id": booking_id,
        "user_id": booking.get("user_id"),
        "qr_code": qr_base64,
        "ticket_summary": ticket_summary,
        "status": "active"
    })

    return {"success": True, "qr_code": qr_base64}
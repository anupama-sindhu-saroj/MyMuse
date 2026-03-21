from app.agents.payment.payment_chain import run_payment_chain
from app.agents.payment.razorpay_service import create_order, verify_payment
from app.agents.payment.qr_generator import generate_qr
from app.db.database import db

async def handle_payment(user_id: str, user_message: str, memory) -> str:
    chat_history = memory.load_memory_variables({}).get("chat_history", "")

    # Fetch latest pending booking for this user
    booking = await db["bookings"].find_one(
        {"user_id": user_id, "status": "pending"},
        sort=[("created_at", -1)]
    )

    if not booking:
        return "I couldn't find any pending booking for you. Would you like to book tickets?"

    booking_id = str(booking["_id"])
    amount = booking.get("total_amount", 0)

    # Create Razorpay order
    order = create_order(amount=amount, booking_id=booking_id)

    payment_link = f"https://rzp.io/rzp/{order['id']}"

    booking_details = f"""
    Booking ID : {booking_id}
    Show       : {booking.get('show_name')}
    Date       : {booking.get('date')}
    Tickets    : {booking.get('ticket_count')}
    Amount     : ₹{amount}
    """

    response = await run_payment_chain(
        booking_details=booking_details,
        payment_status=f"PENDING — Pay here: {payment_link}",
        chat_history=str(chat_history),
        user_message=user_message
    )

    return response


async def confirm_payment_and_generate_qr(
    booking_id: str,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> dict:

    is_valid = verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if not is_valid:
        return {"success": False, "message": "Payment verification failed"}

    # Update booking status
    await db["bookings"].update_one(
        {"_id": booking_id},
        {"$set": {"status": "confirmed", "payment_id": razorpay_payment_id}}
    )

    booking = await db["bookings"].find_one({"_id": booking_id})

    # Generate QR
    qr_base64 = generate_qr(
        booking_id=booking_id,
        user_name=booking.get("user_name", "Guest"),
        show_name=booking.get("show_name", "Museum Visit"),
        date=booking.get("date", "")
    )

    # Save QR to tickets collection
    await db["tickets"].insert_one({
        "booking_id": booking_id,
        "user_id": booking.get("user_id"),
        "qr_code": qr_base64,
        "status": "active"
    })

    return {"success": True, "qr_code": qr_base64}
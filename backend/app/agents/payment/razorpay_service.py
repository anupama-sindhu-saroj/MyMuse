import razorpay
from app.core.config import settings

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

def create_order(amount: int, booking_id: str) -> dict:
    """amount in paise (multiply rupees x 100)"""
    order = client.order.create({
        "amount": amount * 100,
        "currency": "INR",
        "receipt": booking_id,
        "notes": {"booking_id": booking_id}
    })
    return order

def verify_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })
        return True
    except Exception:
        return False

def create_refund(payment_id: str, amount: int) -> dict:
    refund = client.payment.refund(payment_id, {
        "amount": amount * 100
    })
    return refund
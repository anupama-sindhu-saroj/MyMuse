from fastapi import APIRouter
from app.agents.payment.payment_agent import handle_payment, confirm_payment_and_generate_qr

router = APIRouter()

@router.post("/payment/create")
async def create_payment(data: dict):
    user_id = data.get("user_id")
    message = data.get("message", "I want to pay")
    from app.chains.memory import get_memory
    memory = get_memory(user_id)
    response = await handle_payment(user_id, message, memory)
    return {"response": response}

@router.post("/payment/verify")
async def verify_payment(data: dict):
    result = await confirm_payment_and_generate_qr(
        booking_id=data.get("booking_id"),
        razorpay_order_id=data.get("razorpay_order_id"),
        razorpay_payment_id=data.get("razorpay_payment_id"),
        razorpay_signature=data.get("razorpay_signature")
    )
    return result
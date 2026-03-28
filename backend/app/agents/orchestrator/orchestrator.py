from app.agents.orchestrator.router_chain import detect_intent
from app.chains.memory import get_memory
from app.agents.booking.booking_agent import booking_agent
async def handle_message(user_id: str, user_message: str) -> dict:
    memory = get_memory(user_id)
    chat_history = memory.messages

    intent = await detect_intent(user_message, str(chat_history))

    memory.add_user_message(user_message)

    # YOUR WORK ✅
    if intent == "PAYMENT_STATUS":
        from app.agents.payment.payment_agent import handle_payment
        result = await handle_payment(user_id, user_message, memory)
        memory.add_ai_message(result["response"])  # ✅ only store text
        return {
            "intent": intent,
            "response": result["response"],      # ✅ text for chat bubble
            "order_id": result.get("order_id"),  # ✅ for Razorpay popup
            "amount": result.get("amount"),      # ✅ for Razorpay popup
            "booking_id": result.get("booking_id")  # ✅ for verify call
        }


    # YOUR WORK ✅
    elif intent == "GREETING":
        response = "Welcome to the Museum! 🏛️ How can I help you today? You can book tickets or ask anything about the museum."

    # FRIEND'S WORK - placeholder until they finish ⏳
    elif intent == "BOOK_TICKET":
        result = await booking_agent(
            message=user_message,
            session_id=user_id,
            user_data={"user_id": user_id}
        )
        memory.add_ai_message(result["reply"])
        return {
            "intent": "BOOK_TICKET",
            "response": result["reply"],
            "booking_data": result.get("booking_data")
        }

    elif intent == "FAQ":
        from app.agents.faq.faq_agent import faq_agent
        response = await faq_agent(
            message=user_message,
            session_id=user_id
        )

    elif intent == "CANCEL_TICKET":
        response = "Cancellation system coming soon! ❌"

    else:
        response = "I didn't understand. Try asking about tickets or the museum!"

    memory.add_ai_message(response)

    return {"intent": intent, "response": response}
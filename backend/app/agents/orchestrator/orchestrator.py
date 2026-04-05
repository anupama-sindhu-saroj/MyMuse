from app.agents.orchestrator.router_chain import detect_intent
from app.chains.memory import get_memory
from app.agents.booking.booking_agent import booking_agent, get_session


async def handle_message(user_id: str, user_message: str, user_data: dict = None) -> dict:
    memory = get_memory(user_id)
    chat_history = memory.messages

    intent = await detect_intent(user_message, str(chat_history))
    memory.add_user_message(user_message)

    if intent == "PAYMENT_STATUS":
        from app.agents.payment.payment_agent import handle_payment
        result = await handle_payment(user_id, user_message, memory)
        memory.add_ai_message(result["response"])
        return {
            "intent": intent,
            "response": result["response"],
            "order_id": result.get("order_id"),
            "amount": result.get("amount"),
            "booking_id": result.get("booking_id")
        }

    if intent == "GREETING":
        existing = await get_session(user_id)
        if not existing.get("museum_id"):
            response = "Welcome to the Museum! 🏛️ How can I help you today? You can book tickets or ask anything about the museum."
            memory.add_ai_message(response)
            return {"intent": intent, "response": response}
    result = await booking_agent(
        message=user_message,
        session_id=user_id,
        user_data=user_data or {"user_id": user_id}
    )
    memory.add_ai_message(result["reply"])
    return {
        "intent": "BOOK_TICKET",
        "response": result["reply"],
        "booking_data": result.get("booking_data"),
        "booking_id": result.get("booking_id"),
        "ready_for_payment": result.get("ready_for_payment", False)
    }
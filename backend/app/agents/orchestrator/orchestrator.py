from app.agents.orchestrator.router_chain import detect_intent
from app.chains.memory import get_memory

async def handle_message(user_id: str, user_message: str) -> dict:
    memory = get_memory(user_id)
    chat_history = memory.messages

    intent = await detect_intent(user_message, str(chat_history))

    memory.add_user_message(user_message)

    # YOUR WORK ✅
    if intent == "PAYMENT_STATUS":
        from app.agents.payment.payment_agent import handle_payment
        response = await handle_payment(user_id, user_message, memory)

    # YOUR WORK ✅
    elif intent == "GREETING":
        response = "Welcome to the Museum! 🏛️ How can I help you today? You can book tickets or ask anything about the museum."

    # FRIEND'S WORK - placeholder until they finish ⏳
    elif intent == "BOOK_TICKET":
        response = "Booking system coming soon! 🎟️"

    elif intent == "FAQ":
        response = "FAQ system coming soon! ❓"

    elif intent == "CANCEL_TICKET":
        response = "Cancellation system coming soon! ❌"

    else:
        response = "I didn't understand. Try asking about tickets or the museum!"

    memory.add_ai_message(response)

    return {"intent": intent, "response": response}
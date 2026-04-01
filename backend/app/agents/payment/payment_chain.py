import asyncio
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.payment.prompts import PAYMENT_CONFIRMATION_PROMPT

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0
)

payment_prompt = PromptTemplate(
    input_variables=["booking_details", "payment_status", "chat_history", "user_message"],
    template=PAYMENT_CONFIRMATION_PROMPT
)

chain = payment_prompt | llm

async def run_payment_chain(
    booking_details: str,
    payment_status: str,
    chat_history: str,
    user_message: str,
    retries: int = 3,        # ← retry up to 3 times
    delay: float = 45.0      # ← wait 45s between retries (free tier resets/min)
) -> str:
    for attempt in range(retries):
        try:
            result = await chain.ainvoke({
                "booking_details": booking_details,
                "payment_status": payment_status,
                "chat_history": chat_history,
                "user_message": user_message
            })
            return result.content

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < retries - 1:
                    await asyncio.sleep(delay)  # ← wait then retry
                    continue
            # Non-rate-limit error — return fallback immediately
            return "UPI is recommended for fastest and most secure checkout."

    # All retries exhausted
    return "UPI is recommended for fastest and most secure checkout."
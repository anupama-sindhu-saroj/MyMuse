from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.payment.prompts import PAYMENT_CONFIRMATION_PROMPT

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
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
    user_message: str
) -> str:
    result = await chain.ainvoke({
        "booking_details": booking_details,
        "payment_status": payment_status,
        "chat_history": chat_history,
        "user_message": user_message
    })
    return result.content
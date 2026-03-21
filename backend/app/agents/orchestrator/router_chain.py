from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.orchestrator.prompts import INTENT_CLASSIFICATION_PROMPT

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0
)

intent_prompt = PromptTemplate(
    input_variables=["chat_history", "user_message"],
    template=INTENT_CLASSIFICATION_PROMPT
)

chain = intent_prompt | llm

async def detect_intent(user_message: str, chat_history: str = "") -> str:
    result = await chain.ainvoke({
        "chat_history": chat_history,
        "user_message": user_message
    })
    return result.content.strip().upper()
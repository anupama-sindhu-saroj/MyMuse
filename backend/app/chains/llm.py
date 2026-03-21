from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

llm = ChatOpenAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    openai_api_key=settings.OPENAI_API_KEY
)
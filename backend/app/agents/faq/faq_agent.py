from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import settings

# ── LLM setup ────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY
)

search_tool = DuckDuckGoSearchRun()

# ── Session memory ────────────────────────────────────────────
_sessions = {}

SYSTEM_PROMPT = """You are Alpha, a sophisticated museum discovery assistant for the Museo platform.

Your job on the Explore page is to help visitors DISCOVER and DECIDE which museum to visit.

You can:
- Find museums near any city or location worldwide
- Give info about exhibitions, timings, ticket prices
- Make personalized recommendations based on interests
- Answer questions in ANY language the user writes in

You CANNOT book tickets — for booking, always say "Click Book Ticket on any card to book."

When asked about museums near a location:
- Give 3-5 specific real museums
- Include name, brief description, and why it's worth visiting
- Keep it conversational and warm

Always respond in the SAME language the user writes in."""

SEARCH_KEYWORDS = [
    "museum", "exhibit", "gallery", "visit", "near", "find",
    "open", "ticket", "show", "art", "science", "history",
    "recommend", "suggest", "what should", "where"
]


def get_session(session_id: str):
    if session_id not in _sessions:
        _sessions[session_id] = [SystemMessage(content=SYSTEM_PROMPT)]
    return _sessions[session_id]


async def faq_agent(message: str, session_id: str, location: str = None) -> str:
    """
    Main FAQ agent for the Explore page.
    Searches web for museum info and responds conversationally.
    """
    history = get_session(session_id)

    needs_search = any(word in message.lower() for word in SEARCH_KEYWORDS)

    context = ""
    if needs_search:
        try:
            query = f"museums {message}"
            if location and "near" in message.lower():
                query = f"museums near {location}"
            results = search_tool.run(query)
            context = f"\n\n[Live search results]:\n{results}\n[End of search results]\n"
        except Exception:
            context = ""

    full_msg = message + context
    history.append(HumanMessage(content=full_msg))

    response = await llm.ainvoke(history)
    reply = response.content.strip()

    # Store clean message in history
    history[-1] = HumanMessage(content=message)
    history.append(AIMessage(content=reply))

    # Keep last 20 exchanges
    if len(history) > 21:
        _sessions[session_id] = [history[0]] + history[-20:]

    return reply
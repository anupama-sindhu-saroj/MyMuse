from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import settings
import json

router = APIRouter()

_sessions = {}

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    google_api_key=settings.GEMINI_API_KEY
)

search_tool = DuckDuckGoSearchRun()

EXPLORE_SYSTEM_PROMPT = """You are Alpha, a sophisticated museum discovery assistant for the Museo platform.

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

MUSEUM_SEARCH_SYSTEM = """You are a museum data extractor. Given search results about museums,
extract and return a JSON array of museums. Each museum must have:
{
  "title": "Museum Name",
  "city": "City, Country",
  "desc": "One sentence description",
  "img": "https://source.unsplash.com/800x600/?museum,cityname",
  "category": "art/science/history/culture"
}

For the img field — generate a unique Unsplash URL using the museum's city:
Format: https://source.unsplash.com/800x600/?museum,CITYNAME
Example for Louvre in Paris: https://source.unsplash.com/800x600/?museum,paris
Example for Met in New York: https://source.unsplash.com/800x600/?museum,newyork

Return ONLY valid JSON array. No explanation. No markdown. Max 6 museums."""


def get_session(session_id: str):
    if session_id not in _sessions:
        _sessions[session_id] = [SystemMessage(content=EXPLORE_SYSTEM_PROMPT)]
    return _sessions[session_id]


async def search_and_respond(message: str, session_id: str, location: str = None) -> str:
    history = get_session(session_id)

    search_keywords = ["museum", "exhibit", "gallery", "visit", "near", "find",
                       "open", "ticket", "show", "art", "science", "history",
                       "recommend", "suggest", "what should", "where"]
    needs_search = any(word in message.lower() for word in search_keywords)

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

    history[-1] = HumanMessage(content=message)
    history.append(AIMessage(content=reply))

    if len(history) > 21:
        _sessions[session_id] = [history[0]] + history[-20:]

    return reply


# ── Schemas ───────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "guest"
    user_id: Optional[str] = None
    location: Optional[str] = None
    mode: Optional[str] = "explore"


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    intent: Optional[str] = None
    booking_data: Optional[dict] = None


class MuseumSearchRequest(BaseModel):
    query: str
    location: Optional[str] = None


class MuseumCard(BaseModel):
    title: str
    city: str
    desc: str
    img: str
    category: str


class MuseumSearchResponse(BaseModel):
    museums: List[MuseumCard]
    chat_reply: str


# ── Main chat endpoint ────────────────────────────────────────
@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or request.user_id or "guest"
    mode = request.mode or "explore"

    # ── BOOKING MODE → her orchestrator ──────────────────────
    if mode == "booking":
        try:
            from app.agents.orchestrator.orchestrator import handle_message
            result = await handle_message(
                user_id=session_id,
                user_message=request.message
            )
            reply = result.get("response") or result.get("reply", "")
            return ChatResponse(
                reply=reply,
                session_id=session_id,
                intent=result.get("intent"),
                booking_data=result.get("booking_data")
            )
        except ImportError:
            return ChatResponse(
                reply="Booking system is being set up. Please try again shortly.",
                session_id=session_id,
                intent="UNKNOWN"
            )
        except Exception as e:
            print(f"Booking error: {e}")
            return ChatResponse(
                reply="Sorry, booking is unavailable right now. Please try again.",
                session_id=session_id,
                intent="UNKNOWN"
            )

    # ── EXPLORE MODE → your FAQ logic ────────────────────────
    try:
        reply = await search_and_respond(
            request.message, session_id, request.location
        )
    except Exception as e:
        print(f"Chat error: {e}")
        reply = "Sorry, I'm having trouble right now. Please try again."

    return ChatResponse(reply=reply, session_id=session_id)


# ── Her /chat route (backwards compatibility) ─────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat_booking(request: ChatRequest):
    request.mode = "booking"
    return await chat(request)


# ── Museum search endpoint ────────────────────────────────────
@router.post("/api/museums/search", response_model=MuseumSearchResponse)
async def search_museums(request: MuseumSearchRequest):
    try:
        query = request.query
        if request.location and not query:
            query = f"best museums near {request.location}"

        search_results = search_tool.run(f"museums {query}")

        extract_llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-lite",
            google_api_key=settings.GEMINI_API_KEY
        )

        extraction = await extract_llm.ainvoke([
            SystemMessage(content=MUSEUM_SEARCH_SYSTEM),
            HumanMessage(content=f"Search results:\n{search_results}")
        ])

        raw = extraction.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].replace("json", "").strip()

        museums_data = json.loads(raw)

        museums = []
        for m in museums_data[:6]:
            if not m.get("img") or m["img"] == "":
                city = m.get("city", "museum").split(",")[0].lower().replace(" ", "")
                m["img"] = f"https://source.unsplash.com/800x600/?museum,{city}"
            museums.append(MuseumCard(**m))

        chat_reply = await search_and_respond(
            f"Tell me briefly about museums found for: {query}",
            "grid_session",
            request.location
        )

        return MuseumSearchResponse(museums=museums, chat_reply=chat_reply)

    except Exception as e:
        print(f"Museum search error: {e}")
        fallback = [
            MuseumCard(
                title="National Museum",
                city="New Delhi, India",
                desc="India's largest museum with artifacts spanning 5000 years of history.",
                img="https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&q=80&w=800",
                category="history"
            ),
            MuseumCard(
                title="Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
                city="Mumbai, India",
                desc="Premier art and history museum with an impressive collection of Indian art.",
                img="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800",
                category="art"
            ),
            MuseumCard(
                title="Indian Museum",
                city="Kolkata, India",
                desc="Oldest and largest museum in India with rare antiques and Mughal paintings.",
                img="https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&q=80&w=800",
                category="culture"
            ),
            MuseumCard(
                title="Salar Jung Museum",
                city="Hyderabad, India",
                desc="Houses one of the world's largest one-man collections of art and antiques.",
                img="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
                category="art"
            ),
        ]
        return MuseumSearchResponse(
            museums=fallback,
            chat_reply="Here are some popular museums in India you might enjoy visiting!"
        )
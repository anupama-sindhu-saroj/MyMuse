from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.agents.faq.faq_agent import faq_agent
from app.agents.faq.vector_store import search_museums

router = APIRouter()


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


# ── Chat endpoint ─────────────────────────────────────────────
@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or request.user_id or "guest"
    mode = request.mode or "explore"

    # BOOKING → orchestrator
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
                reply="Sorry, booking is unavailable right now.",
                session_id=session_id,
                intent="UNKNOWN"
            )

    # EXPLORE → faq agent
    try:
        reply = await faq_agent(request.message, session_id, request.location)
    except Exception as e:
        print(f"Chat error: {e}")
        reply = "Sorry, I'm having trouble right now. Please try again."

    return ChatResponse(reply=reply, session_id=session_id)


# ── Her /chat route ───────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat_booking(request: ChatRequest):
    request.mode = "booking"
    return await chat(request)


# ── Museum search endpoint ────────────────────────────────────
@router.post("/api/museums/search", response_model=MuseumSearchResponse)
async def search_museums_endpoint(request: MuseumSearchRequest):
    try:
        query = request.query
        if request.location and not query:
            query = f"museums near {request.location}"

        museums_data = await search_museums(query, request.location)
        museums = [MuseumCard(**m) for m in museums_data]

        return MuseumSearchResponse(
            museums=museums,
            chat_reply=f"Found {len(museums)} museums! Click any card to learn more."
        )

    except Exception as e:
        print(f"Museum search error: {e}")
        fallback = [
            MuseumCard(title="National Museum", city="New Delhi, India",
                desc="India's largest museum spanning 5000 years of history.",
                img="https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
                category="history"),
            MuseumCard(title="Chhatrapati Shivaji Maharaj Vastu Sangrahalaya", city="Mumbai, India",
                desc="Premier art and history museum with impressive Indian art collection.",
                img="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
                category="art"),
            MuseumCard(title="Indian Museum", city="Kolkata, India",
                desc="Oldest museum in India with rare antiques and Mughal paintings.",
                img="https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80",
                category="culture"),
            MuseumCard(title="Salar Jung Museum", city="Hyderabad, India",
                desc="Houses one of the world's largest one-man collections of antiques.",
                img="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
                category="art"),
        ]
        return MuseumSearchResponse(
            museums=fallback,
            chat_reply="Here are some popular museums in India!"
        )
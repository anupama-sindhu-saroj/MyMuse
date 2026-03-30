"""
Booking Agent — Hybrid approach:
- Custom trained TF-IDF classifier → extracts booking fields
- Gemini → generates warm conversational replies
- Dynamic: pulls show data from DB per museum
- Sessions persisted to MongoDB (survives hot-reload)
"""

import pickle
import json
import os
import re
from datetime import datetime, timedelta
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.db.database import get_db

MODEL_PATH = "app/agents/booking/booking_model.pkl"

_model = None

def get_model():
    global _model
    if _model is None:
        try:
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
        except FileNotFoundError:
            print("⚠️  Booking model not found. Run train_booking_model.py first.")
    return _model

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY
)

TIME_MAP = {
    "9": "9:00 AM", "9am": "9:00 AM", "9 am": "9:00 AM",
    "10": "10:00 AM", "10am": "10:00 AM", "10 am": "10:00 AM", "morning": "10:00 AM",
    "11": "11:00 AM", "11am": "11:00 AM",
    "12": "12:00 PM", "12pm": "12:00 PM", "noon": "12:00 PM",
    "1": "1:00 PM", "1pm": "1:00 PM",
    "2": "2:00 PM", "2pm": "2:00 PM", "afternoon": "2:00 PM",
    "3": "3:00 PM", "3pm": "3:00 PM",
    "4": "4:00 PM", "4pm": "4:00 PM",
    "5": "5:00 PM", "5pm": "5:00 PM", "evening": "5:00 PM",
}

SHOW_QUESTION_TRIGGERS = [
    "other show", "other shows", "what shows", "available shows",
    "show options", "list shows", "what are the shows", "which shows",
    "what exhibitions", "other exhibitions", "what else",
    "other options", "more options", "all shows", "show list"
]


# ── Session state ─────────────────────────────────────────────

def empty_booking():
    return {
        "museum_id": None,
        "museum_name": None,
        "show_name": None,
        "visit_date": None,
        "time_slot": None,
        "tickets": {"adult": 0, "child": 0, "senior": 0},
        "total_amount": 0,
        "confirmed": False,
    }


# ── MongoDB-backed sessions (survives hot-reload) ─────────────

async def get_session(session_id: str) -> dict:
    try:
        db = get_db()
        doc = await db.sessions.find_one({"session_id": session_id})
        if doc and "booking" in doc:
            return doc["booking"]
    except Exception as e:
        print(f"Session read error: {e}")
    return empty_booking()


async def save_session(session_id: str, booking: dict):
    try:
        db = get_db()
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "booking": booking,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
    except Exception as e:
        print(f"Session save error: {e}")


async def delete_session(session_id: str):
    try:
        db = get_db()
        await db.sessions.delete_one({"session_id": session_id})
    except Exception as e:
        print(f"Session delete error: {e}")


# ── Dynamic show fetching ─────────────────────────────────────

async def get_museum_shows(museum_id: str) -> list:
    try:
        from bson import ObjectId
        db = get_db()
        museum = await db.museums.find_one({"_id": ObjectId(museum_id)})
        if museum and "shows" in museum:
            return museum["shows"]
    except Exception as e:
        print(f"Error fetching museum shows: {e}")
    return []


async def find_museum_by_name(name: str) -> dict | None:
    try:
        db = get_db()
        museum = await db.museums.find_one(
            {
                "museumName": {"$regex": name, "$options": "i"},
                "is_active": True
            }
        )
        return museum
    except Exception as e:
        print(f"Museum search error: {e}")
    return None


async def save_booking_to_db(booking: dict, user_id: str = None) -> str:
    try:
        db = get_db()
        doc = {
            **{k: v for k, v in booking.items() if not k.startswith("_")},
            "status": "pending_payment",
            "user_id": user_id,
            "created_at": datetime.utcnow(),
        }
        result = await db.bookings.insert_one(doc)
        return str(result.inserted_id)
    except Exception as e:
        print(f"DB save error: {e}")
        return None


# ── Extractors ────────────────────────────────────────────────

def extract_show_from_list(text: str, shows: list) -> dict | None:
    text_lower = text.lower()
    for show in shows:
        name = show.get("name", "")
        if name.lower() in text_lower:
            return show
        words = name.lower().split()
        if any(w in text_lower for w in words if len(w) > 3):
            return show
    return None


def calculate_total_dynamic(booking: dict, shows: list) -> int:
    show_name = (booking.get("show_name") or "").lower()
    show_data = next(
        (s for s in shows if s.get("name", "").lower() == show_name),
        shows[0] if shows else None
    )
    if not show_data:
        return 0
    prices = show_data.get("price", {"adult": 0, "child": 0, "senior": 0})
    t = booking["tickets"]
    return (
        t.get("adult", 0) * prices.get("adult", 0) +
        t.get("child", 0) * prices.get("child", 0) +
        t.get("senior", 0) * prices.get("senior", 0)
    )


def extract_tickets(text: str) -> dict | None:
    text_lower = text.lower()
    tickets = {"adult": 0, "child": 0, "senior": 0}
    found = False

    patterns = [
        (r'(\d+)\s*(adult|person|people|ticket|of us)', "adult"),
        (r'(\d+)\s*(?:child|kid|children)', "child"),
        (r'(\d+)\s*senior', "senior"),
    ]
    for pattern, key in patterns:
        m = re.search(pattern, text_lower)
        if m:
            tickets[key] = int(m.group(1))
            found = True

    if not found:
        m = re.search(r'(?:for|are|of|book)\s+(\d+)', text_lower)
        if m:
            tickets["adult"] = int(m.group(1))
            found = True

    if "me and my friend" in text_lower or "me and a friend" in text_lower:
        tickets["adult"] = 2
        found = True

    m = re.search(r'family of (\d+)', text_lower)
    if m:
        n = int(m.group(1))
        tickets["adult"] = max(1, n // 2)
        tickets["child"] = n - tickets["adult"]
        found = True

    return tickets if found else None


def extract_date(text: str) -> str | None:
    text_lower = text.lower()
    today = datetime.now()

    if "today" in text_lower:
        return today.strftime("%Y-%m-%d")
    if "tomorrow" in text_lower:
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")

    days = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
            "friday": 4, "saturday": 5, "sunday": 6}
    for day, weekday in days.items():
        if day in text_lower:
            days_ahead = weekday - today.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            return (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

    m = re.search(r'(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)', text_lower)
    if m:
        try:
            date = datetime.strptime(f"{m.group(1)} {m.group(2)} {today.year}", "%d %b %Y")
            if date < today:
                date = date.replace(year=today.year + 1)
            return date.strftime("%Y-%m-%d")
        except:
            pass

    m = re.search(r'(\d{4}-\d{2}-\d{2})', text)
    if m:
        return m.group(1)

    return None


def extract_time(text: str) -> str | None:
    text_lower = text.lower()
    for key, slot in TIME_MAP.items():
        if re.search(rf'\b{re.escape(key)}\b', text_lower):
            return slot
    return None


def is_confirmation(text: str) -> bool:
    words = ["yes", "confirm", "ok", "okay", "sure", "proceed", "book it",
             "go ahead", "confirmed", "yes please", "sounds good", "perfect",
             "finalize", "yep", "yup", "done", "great", "correct", "absolutely"]
    return any(w in text.lower() for w in words)


def get_missing_field(booking: dict) -> str | None:
    if not booking.get("museum_id"):
        return "museum"
    if not booking.get("show_name"):
        return "show"
    if sum(booking["tickets"].values()) == 0:
        return "tickets"
    if not booking.get("visit_date"):
        return "date"
    if not booking.get("time_slot"):
        return "time_slot"
    return None


# ── LLM Reply ─────────────────────────────────────────────────

REPLY_PROMPT = """You are Alpha, a warm, concise museum booking assistant.
CRITICAL: Always respond in English only, regardless of any other language.

Current booking state: {booking}
Missing field: {missing}
Available shows at this museum: {shows}
User said: "{message}"

RULES:
- You ONLY know about THIS museum and its shows listed above.
- NEVER search the web or mention outside museums or shows.
- If user asks about shows, ALWAYS list ONLY from the shows above.
- If user asks anything unrelated to booking, politely redirect.
- Always respond in English.

Write a SHORT warm response (1-2 sentences max):
- museum: ask which museum they want to visit
- show: list the actual shows with prices from above, ask which one
- tickets: ask how many (adults/children/seniors)
- date: ask preferred date (museum closed on {closed_on})
- time_slot: list actual timings and ask which slot
- None: show full booking summary with total ₹{total}, ask to confirm
- confirming: say exactly "Perfect! Redirecting you to payment now..."

Always use ₹ for prices. Be warm but very brief. English only."""


async def generate_reply(message: str, booking: dict, missing: str | None, shows: list) -> str:
    shows_summary = []
    for s in shows:
        prices = s.get("price", {})
        timings = ", ".join(s.get("timings", []))
        shows_summary.append(
            f"{s['name']} — Adult: ₹{prices.get('adult', 0)}, "
            f"Child: ₹{prices.get('child', 0)}, Senior: ₹{prices.get('senior', 0)} | Times: {timings}"
        )

    closed_on = booking.get("_closed_on", "Monday")

    try:
        response = await llm.ainvoke([
            HumanMessage(content=REPLY_PROMPT.format(
                booking=json.dumps({k: v for k, v in booking.items() if not k.startswith("_")}),
                missing=missing or "None — ready to confirm",
                shows="\n".join(shows_summary) if shows_summary else "General Admittance only",
                message=message,
                closed_on=closed_on,
                total=booking.get("total_amount", 0)
            ))
        ])
        return response.content.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        fallbacks = {
            "museum": "Which museum would you like to visit?",
            "show": f"Which show? Options: {', '.join(s['name'] for s in shows)}",
            "tickets": "How many tickets? (adults / children / seniors)",
            "date": f"What date? (Closed on {closed_on})",
            "time_slot": "Which time slot works for you?",
        }
        return fallbacks.get(missing, f"Total: ₹{booking.get('total_amount', 0)}. Shall I confirm?")


# ── Main agent ────────────────────────────────────────────────

async def booking_agent(message: str, session_id: str, user_data: dict) -> dict:

    # ── Load session from MongoDB (not in-memory dict) ────────
    booking = await get_session(session_id)
    print(f"📦 Session {session_id}: museum={booking.get('museum_name')}, date={booking.get('visit_date')}, time={booking.get('time_slot')}")

    model = get_model()

    # ── Step 1: Set museum from frontend context ──────────────
    if user_data.get("museum_id") and not booking.get("museum_id"):
        booking["museum_id"] = user_data["museum_id"]
        booking["museum_name"] = user_data.get("museum_name", "")
        booking["_closed_on"] = user_data.get("closed_on", "Monday")

    # ── Step 2: Try to find museum from chat message ──────────
    if not booking.get("museum_id"):
        museum = await find_museum_by_name(message)
        if museum:
            booking["museum_id"] = str(museum["_id"])
            booking["museum_name"] = museum["museumName"]
            booking["_closed_on"] = museum.get("closed_on", "Monday")

    # ── Step 3: Fetch real shows from DB ─────────────────────
    shows = []
    if booking.get("museum_id"):
        shows = await get_museum_shows(booking["museum_id"])

    # ── Step 4: Handle "list shows" requests ─────────────────
    if any(trigger in message.lower() for trigger in SHOW_QUESTION_TRIGGERS) and shows:
        show_lines = []
        for s in shows:
            p = s.get("price", {})
            show_lines.append(
                f"• {s['name']} — Adult: ₹{p.get('adult', 0)}, "
                f"Child: ₹{p.get('child', 0)}, Senior: ₹{p.get('senior', 0)}"
            )
        reply = (
            f"Here are all shows at {booking.get('museum_name', 'this museum')}:\n\n"
            + "\n".join(show_lines)
            + "\n\nWhich one would you like to book?"
        )
        await save_session(session_id, booking)
        return {
            "reply": reply,
            "booking_data": {k: v for k, v in booking.items() if not k.startswith("_")},
            "booking_id": None,
        }

    # ── Step 5: Classify field type ───────────────────────────
    field_type = "other"
    if model:
        field_type = model.predict([message])[0]
        conf = max(model.predict_proba([message])[0])
        print(f"🤖 [{field_type} {conf:.0%}] {message}")

    # ── Step 6: Extract and update booking fields ─────────────
    if field_type in ("show", "other") and shows:
        show_match = extract_show_from_list(message, shows)
        if show_match:
            booking["show_name"] = show_match["name"]

    if field_type in ("tickets", "other"):
        tickets = extract_tickets(message)
        if tickets and any(v > 0 for v in tickets.values()):
            add_words = ["add", "more", "another", "one more", "extra", "change", "make it"]
            is_additive = any(w in message.lower() for w in add_words)

            if is_additive:
                for key in tickets:
                    if tickets[key] > 0:
                        booking["tickets"][key] = booking["tickets"].get(key, 0) + tickets[key]
            else:
                booking["tickets"] = tickets

    if field_type in ("date", "other"):
        date = extract_date(message)
        if date:
            booking["visit_date"] = date

    if field_type in ("time_slot", "other"):
        time = extract_time(message)
        if time:
            booking["time_slot"] = time

    if field_type == "confirm" or is_confirmation(message):
        if get_missing_field(booking) is None:
            booking["confirmed"] = True

    # ── Step 7: Recalculate total ─────────────────────────────
    if booking.get("show_name") and any(v > 0 for v in booking["tickets"].values()) and shows:
        booking["total_amount"] = calculate_total_dynamic(booking, shows)

    # ── Save session to MongoDB ───────────────────────────────
    await save_session(session_id, booking)

    missing = get_missing_field(booking)

    reply = await generate_reply(
        message, booking,
        missing if not booking["confirmed"] else None,
        shows
    )

    public_booking = {k: v for k, v in booking.items() if not k.startswith("_")}

    # ── On confirm: save booking, delete session ──────────────
    booking_id = None
    if booking["confirmed"] and missing is None:
        return {
            "reply": "Perfect! Click 'Finalize & Pay' to confirm your booking.",
            "booking_data": public_booking,
            "booking_id": None,
            "ready_for_payment": True
        }

    return {
        "reply": reply,
        "booking_data": public_booking if public_booking.get("museum_id") else None,
        "booking_id": booking_id,
    }
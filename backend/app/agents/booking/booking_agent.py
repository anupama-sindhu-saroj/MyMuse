"""
Booking Agent — Hybrid approach:
- Custom trained TF-IDF classifier → extracts booking fields
- Gemini → generates warm conversational replies
"""

import pickle
import json
import os
import re
from datetime import datetime, timedelta
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings

# ── Load trained model ────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "booking_model.pkl")
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            print("✅ Booking model loaded")
        except FileNotFoundError:
            print("⚠️  Booking model not found. Run train_booking_model.py first.")
    return _model

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    google_api_key=settings.GEMINI_API_KEY
)

_sessions = {}

SHOWS = {
    "general admittance": {"id": "show_000", "price": {"adult": 200, "child": 100, "senior": 150}},
    "dinosaur exhibit": {"id": "show_001", "price": {"adult": 350, "child": 200, "senior": 300}},
    "space & cosmos gallery": {"id": "show_002", "price": {"adult": 300, "child": 175, "senior": 250}},
    "ancient egypt": {"id": "show_003", "price": {"adult": 320, "child": 180, "senior": 270}},
    "modern art collection": {"id": "show_004", "price": {"adult": 280, "child": 150, "senior": 230}},
}

TIME_MAP = {
    "10": "10:00 AM", "10am": "10:00 AM", "10 am": "10:00 AM", "morning": "10:00 AM",
    "12": "12:00 PM", "12pm": "12:00 PM", "noon": "12:00 PM",
    "2": "2:00 PM", "2pm": "2:00 PM", "2 pm": "2:00 PM", "afternoon": "2:00 PM",
    "4": "4:00 PM", "4pm": "4:00 PM", "4 pm": "4:00 PM", "evening": "4:00 PM",
}

def empty_booking():
    return {
        "show_name": None, "show_id": None,
        "visit_date": None, "time_slot": None,
        "tickets": {"adult": 0, "child": 0, "senior": 0},
        "total_amount": 0, "confirmed": False,
        "museum_name": None
    }

def extract_show(text):
    text_lower = text.lower()
    for show_name in SHOWS:
        key = show_name.split()[0]
        if key in text_lower or show_name in text_lower:
            return show_name.title()
    return None

def extract_tickets(text):
    text_lower = text.lower()
    tickets = {"adult": 0, "child": 0, "senior": 0}
    found = False

    m = re.search(r'(\d+)\s*(adult|person|people|ticket|of us)', text_lower)
    if m:
        tickets["adult"] = int(m.group(1))
        found = True

    m = re.search(r'(\d+)\s*ticket', text_lower)
    if m and not found:
        tickets["adult"] = int(m.group(1))
        found = True

    m = re.search(r'(?:for|are|of)\s+(\d+)', text_lower)
    if m and not found:
        tickets["adult"] = int(m.group(1))
        found = True

    m = re.search(r'(\d+)\s*(?:child|kid|children)', text_lower)
    if m:
        tickets["child"] = int(m.group(1))
        found = True

    m = re.search(r'(\d+)\s*senior', text_lower)
    if m:
        tickets["senior"] = int(m.group(1))
        found = True

    if "me and my friend" in text_lower:
        tickets["adult"] = 2
        found = True

    m = re.search(r'family of (\d+)', text_lower)
    if m:
        n = int(m.group(1))
        tickets["adult"] = max(1, n // 2)
        tickets["child"] = n - tickets["adult"]
        found = True

    return tickets if found else None

def extract_date(text):
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
    return None

def extract_time(text):
    text_lower = text.lower()
    for key, slot in TIME_MAP.items():
        if key in text_lower:
            return slot
    return None

def calculate_total(booking):
    show_key = (booking.get("show_name") or "").lower()
    show_info = SHOWS.get(show_key, SHOWS["general admittance"])
    prices = show_info["price"]
    t = booking["tickets"]
    return (
        t.get("adult", 0) * prices["adult"] +
        t.get("child", 0) * prices["child"] +
        t.get("senior", 0) * prices["senior"]
    )

def is_confirmation(text):
    words = ["yes", "confirm", "ok", "okay", "sure", "proceed", "book it",
             "go ahead", "confirmed", "yes please", "sounds good", "perfect",
             "finalize", "yep", "yup", "done", "great"]
    return any(w in text.lower() for w in words)

def get_missing_field(booking):
    if not booking.get("museum_name") and not booking.get("show_name"):
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

REPLY_PROMPT = """You are Alpha, a warm museum booking assistant.
Current booking: {booking}
Missing field: {missing}
User said: {message}

Write a SHORT warm response (1-2 sentences):
- museum: ask which museum they want
- show: list shows with prices, ask which one
- tickets: ask how many (adults/children/seniors)  
- date: ask what date (closed Mondays)
- time_slot: ask which time (10AM, 12PM, 2PM, 4PM)
- None: show full summary, ask to confirm
- confirming: say "Perfect! Redirecting to payment..."

Shows: General Admittance ₹200, Dinosaur Exhibit ₹350, Space & Cosmos ₹300, Ancient Egypt ₹320, Modern Art ₹280
Respond in user's language."""

async def generate_reply(message, booking, missing):
    try:
        response = await llm.ainvoke([
            HumanMessage(content=REPLY_PROMPT.format(
                booking=json.dumps(booking),
                missing=missing or "None — ask to confirm",
                message=message
            ))
        ])
        return response.content.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        fallbacks = {
            "museum": "Which museum would you like to visit?",
            "show": "Which exhibit? General Admittance ₹200, Dinosaur Exhibit ₹350, Space Gallery ₹300, Ancient Egypt ₹320, Modern Art ₹280",
            "tickets": "How many tickets do you need? (adults/children/seniors)",
            "date": "What date would you like to visit? (Closed Mondays)",
            "time_slot": "Which time slot? 10:00 AM | 12:00 PM | 2:00 PM | 4:00 PM",
        }
        return fallbacks.get(missing, f"Summary ready. Total: ₹{booking.get('total_amount', 0)}. Confirm?")

async def booking_agent(message: str, session_id: str, user_data: dict) -> dict:
    booking = _sessions.get(session_id, empty_booking())
    model = get_model()

    # Step 1 — Trained model classifies field type
    field_type = "other"
    if model:
        field_type = model.predict([message])[0]
        conf = max(model.predict_proba([message])[0])
        print(f"🤖 [{field_type} {conf:.0%}] {message}")

    # Step 2 — Extract value
    if field_type in ("show", "other"):
        show = extract_show(message)
        if show:
            booking["show_name"] = show
            booking["show_id"] = SHOWS.get(show.lower(), {}).get("id", "show_000")

    if field_type in ("tickets", "other"):
        tickets = extract_tickets(message)
        if tickets and any(v > 0 for v in tickets.values()):
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

    # Recalculate total
    if booking.get("show_name") and any(v > 0 for v in booking["tickets"].values()):
        booking["total_amount"] = calculate_total(booking)

    _sessions[session_id] = booking
    missing = get_missing_field(booking)

    reply = await generate_reply(
        message, booking,
        missing if not booking["confirmed"] else None
    )

    if booking["confirmed"] and missing is None:
        del _sessions[session_id]

    return {
        "reply": reply,
        "booking_data": booking if (booking.get("museum_name") or booking.get("show_name")) else None
    }
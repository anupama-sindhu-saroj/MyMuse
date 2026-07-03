# app/agents/analytics/analytics_agent.py

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.db.database import get_db
from app.core.config import settings
from datetime import datetime, timedelta
from bson import ObjectId
import json

# ─── LLM ─────────────────────────────────────────────────────────────────────

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=settings.GEMINI_API_KEY
)

ANALYTICS_PROMPT = PromptTemplate(
    input_variables=["museum_name", "data_summary"],
    template="""
You are an expert museum analytics advisor for {museum_name}.
Analyze the data below and give 3 sharp, actionable insights specific to this museum.

Data:
{data_summary}

Respond ONLY in this exact JSON (no markdown, no extra text):
{{
  "insights": [
    {{
      "title": "Max 5 words",
      "detail": "One sentence with the specific data point",
      "action": "One concrete next step",
      "type": "positive | warning | neutral"
    }}
  ],
  "headline": "One powerful sentence about this museum's performance"
}}
"""
)

insight_chain = ANALYTICS_PROMPT | llm | StrOutputParser()


# ─── Data Fetcher ─────────────────────────────────────────────────────────────
# Everything comes from the bookings collection only.
# Filter is museum_name (string) because that's what bookings store.
# Payments are embedded in bookings — payment_status == "paid" means paid.

async def fetch_museum_data(museum_name: str, days: int) -> dict:
    db = get_db()
    since = datetime.utcnow() - timedelta(days=days)

    # All bookings for this museum in the period
    all_bookings = await db.bookings.find({
        "museum_name": museum_name,
        "created_at": {"$gte": since}
    }).to_list(None)

    # Paid bookings only (payment embedded in booking)
    paid_bookings = [b for b in all_bookings if b.get("payment_status") == "paid"]

    # Cancelled bookings
    cancelled_bookings = [b for b in all_bookings if b.get("status") == "cancelled"]

    # Total revenue from total_amount on paid bookings
    total_revenue = sum(b.get("total_amount", 0) for b in paid_bookings)

    # Revenue by day — last 7 days only, from paid bookings
    seven_ago = datetime.utcnow() - timedelta(days=7)
    revenue_by_day = {}
    for b in paid_bookings:
        created = b.get("created_at")
        if created and created >= seven_ago:
            day = created.strftime("%a")
            revenue_by_day[day] = revenue_by_day.get(day, 0) + b.get("total_amount", 0)

    # Bookings count per show
    bookings_by_show = {}
    for b in all_bookings:
        show = b.get("show_name", "Unknown")
        bookings_by_show[show] = bookings_by_show.get(show, 0) + 1

    # Peak hours — when were bookings created
    hour_distribution = {}
    for b in all_bookings:
        created = b.get("created_at")
        if created:
            label = f"{created.hour:02d}:00"
            hour_distribution[label] = hour_distribution.get(label, 0) + 1

    # Weekly revenue trend — last 4 weeks
    revenue_trend = {}
    for i in range(4):
        week_start = datetime.utcnow() - timedelta(days=(4 - i) * 7)
        week_end   = week_start + timedelta(days=7)
        week_rev   = sum(
            b.get("total_amount", 0)
            for b in paid_bookings
            if week_start <= b.get("created_at", datetime.min) < week_end
        )
        revenue_trend[f"Week{i + 1}"] = round(week_rev, 2)

    # Unique users who booked this museum
    unique_users = len(set(b.get("user_id", "") for b in all_bookings))

    return {
        "summary": {
            "total_bookings":      len(all_bookings),
            "paid_bookings":       len(paid_bookings),
            "total_revenue":       round(total_revenue, 2),
            "total_cancellations": len(cancelled_bookings),
            "unique_users":        unique_users,
            "cancellation_rate":   round(len(cancelled_bookings) / max(len(all_bookings), 1) * 100, 1),
            "avg_ticket_value":    round(total_revenue / max(len(paid_bookings), 1), 2),
            "conversion":          round(len(paid_bookings) / max(len(all_bookings), 1) * 100, 1),
        },
        "revenue_by_day":    revenue_by_day,
        "bookings_by_show":  bookings_by_show,
        "hour_distribution": hour_distribution,
        "revenue_trend":     revenue_trend,
    }


# ─── AI Insight Generator ─────────────────────────────────────────────────────

async def generate_insights(museum_name: str, data: dict) -> dict:
    s = data["summary"]

    top_show = max(data["bookings_by_show"], key=data["bookings_by_show"].get) \
               if data["bookings_by_show"] else "N/A"
    peak_hour = max(data["hour_distribution"], key=data["hour_distribution"].get) \
                if data["hour_distribution"] else "N/A"

    summary_text = f"""
Museum: {museum_name}
Total Bookings: {s['total_bookings']}
Paid Bookings: {s['paid_bookings']}
Total Revenue: ₹{s['total_revenue']:,}
Unique Users: {s['unique_users']}
Cancellation Rate: {s['cancellation_rate']}%
Avg Ticket Value: ₹{s['avg_ticket_value']}
Conversion Rate: {s['conversion']}%
Top Show: {top_show} ({data['bookings_by_show'].get(top_show, 0)} bookings)
Peak Booking Hour: {peak_hour}
Revenue Trend (4 weeks): {data['revenue_trend']}
Revenue by Day (last 7 days): {data['revenue_by_day']}
"""

    raw = await insight_chain.ainvoke({
        "museum_name": museum_name,
        "data_summary": summary_text,
    })

    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.strip("`")
            clean = clean.replace("json", "", 1).strip()  # remove leading "json" tag only
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "insights": [],
            "headline": "Analysis complete. Review metrics below."
        }


# ─── Main Entry Points ────────────────────────────────────────────────────────

async def run_analytics_agent(museum_id: str, days: int = 30) -> dict:
    """
    Museum-specific entry point.
    Called by GET /api/analytics/museum/{museum_id}
    1. Looks up museumName from museums collection using the ID
    2. Filters ALL data by that museum_name string
    3. Returns metrics + chart data + GPT-4 insights
    """
    db = get_db()

    museum = await db.museums.find_one({"_id": ObjectId(museum_id)})
    if not museum:
        raise ValueError(f"Museum {museum_id} not found")

    museum_name = museum.get("museumName", "")   # ← museumName not name

    raw = await fetch_museum_data(museum_name, days)
    ai  = await generate_insights(museum_name, raw)

    return {
        "museum_id":   museum_id,
        "museum_name": museum_name,
        "metrics":     raw["summary"],
        "charts": {
            "revenue_by_day":    raw["revenue_by_day"],
            "bookings_by_show":  raw["bookings_by_show"],
            "hour_distribution": raw["hour_distribution"],
            "revenue_trend":     raw["revenue_trend"],
        },
        "ai": ai,
    }


async def run_platform_analytics(days: int = 30) -> dict:
    db = get_db()
    since = datetime.utcnow() - timedelta(days=days)

    all_bookings = await db.bookings.find({"created_at": {"$gte": since}}).to_list(None)
    paid_bookings = [b for b in all_bookings if b.get("payment_status") == "paid"]
    museums = await db.museums.find({}).to_list(None)

    total_revenue = sum(b.get("total_amount", 0) for b in paid_bookings)

    museum_breakdown = {}
    for b in all_bookings:
        mname = b.get("museum_name", "Unknown")
        museum_breakdown.setdefault(mname, {"bookings": 0, "revenue": 0})
        museum_breakdown[mname]["bookings"] += 1
        if b.get("payment_status") == "paid":
            museum_breakdown[mname]["revenue"] += b.get("total_amount", 0)

    summary_data = {
        "summary": {
            "total_museums":  len(museums),
            "total_bookings": len(all_bookings),
            "paid_bookings":  len(paid_bookings),
            "total_revenue":  round(total_revenue, 2),
            "unique_users":   len(set(b.get("user_id", "") for b in all_bookings)),
        },
        "bookings_by_show":  {},       # not applicable platform-wide, keep empty
        "hour_distribution": {},
        "revenue_trend":     {},
        "revenue_by_day":    {},
    }
    ai = await generate_insights("the platform (all museums)", summary_data)

    return {
        "total_museums":    len(museums),
        "total_revenue":    round(total_revenue, 2),
        "total_bookings":   len(all_bookings),
        "paid_bookings":    len(paid_bookings),
        "unique_users":     len(set(b.get("user_id", "") for b in all_bookings)),
        "museum_breakdown": museum_breakdown,
        "ai":               ai,
    }
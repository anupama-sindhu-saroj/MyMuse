import httpx
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings
import json

search_tool = DuckDuckGoSearchRun()

# ── Fallback images by category ───────────────────────────────
IMAGES = {
    "art": [
        "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80",
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
        "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&q=80",
    ],
    "history": [
        "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
        "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80",
        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80",
        "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=800&q=80",
    ],
    "science": [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
        "https://images.unsplash.com/photo-1532094349884-543559059786?w=800&q=80",
        "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&q=80",
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    ],
    "culture": [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80",
        "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=800&q=80",
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
        "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80",
    ],
}

MUSEUM_EXTRACT_PROMPT = """You are a museum data extractor. Given search results about museums,
extract and return a JSON array of museums. Each museum must have:
{
  "title": "Museum Name",
  "city": "City, Country",
  "desc": "One sentence description",
  "img": "",
  "category": "art/science/history/culture"
}

Return ONLY valid JSON array. No explanation. No markdown. Return exactly 6 museums.
Leave img empty — it will be filled automatically."""


def get_fallback_image(category: str, index: int = 0) -> str:
    cat = category.lower() if category else "culture"
    imgs = IMAGES.get(cat, IMAGES["culture"])
    return imgs[index % len(imgs)]


async def fetch_unsplash_image(museum_name: str, city: str = "") -> str:
    """Fetch a relevant image from Unsplash for a museum."""
    try:
        async with httpx.AsyncClient() as client:
            query = f"{museum_name} museum {city}".strip()
            res = await client.get(
                "https://api.unsplash.com/search/photos",
                params={"query": query, "per_page": 1, "orientation": "landscape"},
                headers={"Authorization": f"Client-ID {settings.UNSPLASH_ACCESS_KEY}"},
                timeout=5
            )
            data = res.json()
            results = data.get("results", [])
            if results:
                return results[0]["urls"]["regular"]
    except Exception as e:
        print(f"Unsplash error for {museum_name}: {e}")
    return ""


async def search_museums(query: str, location: str = None) -> list:
    """
    Search web for museums, extract structured data, fetch images.
    Returns list of museum dicts ready for MuseumCard.
    """
    search_query = f"top museums to visit in {query} list"
    search_results = search_tool.run(search_query)

    extract_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY
    )

    extraction = await extract_llm.ainvoke([
        SystemMessage(content=MUSEUM_EXTRACT_PROMPT),
        HumanMessage(content=f"Search results:\n{search_results}")
    ])

    raw = extraction.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1].replace("json", "").strip()

    museums_data = json.loads(raw)

    # Fetch all images in parallel
    async def enrich(m, index):
        city = m.get("city", "").split(",")[0]
        img = await fetch_unsplash_image(m["title"], city)
        m["img"] = img if img else get_fallback_image(m.get("category", "culture"), index)
        return m

    enriched = await asyncio.gather(*[
        enrich(m, i) for i, m in enumerate(museums_data[:6])
    ])

    return list(enriched)
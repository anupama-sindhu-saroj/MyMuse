from fastapi import APIRouter
from app.services.translate_service import translate_text

router = APIRouter()

# Dummy data (replace later with MongoDB)
museums = [
    {
        "title": "Ancient History Museum",
        "desc": "A place full of ancient artifacts and history.",
        "location": "India",
        "image": "https://example.com/img1.jpg"
    },
    {
        "title": "Art Gallery",
        "desc": "Modern and classical art collection.",
        "location": "France",
        "image": "https://example.com/img2.jpg"
    }
]

@router.get("/")
def get_museums(lang: str = "en"):
    response = []

    for m in museums:
        response.append({
            "title": translate_text(m["title"], lang),
            "desc": translate_text(m["desc"], lang),
            "location": translate_text(m["location"], lang),
            "image": m["image"]
        })

    return response
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import get_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    lang: str = "en"

@router.post("/")
def chat(req: ChatRequest):
    reply = get_ai_response(req.message, req.lang)
    return {"reply": reply}
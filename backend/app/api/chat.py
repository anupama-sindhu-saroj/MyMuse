from fastapi import APIRouter, Depends
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.agents.orchestrator.orchestrator import handle_message

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await handle_message(
        user_id=request.user_id,
        user_message=request.message
    )
    return ChatResponse(
        intent=result["intent"],
        response=result["response"]
    )
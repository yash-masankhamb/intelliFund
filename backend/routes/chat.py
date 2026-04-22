from fastapi import APIRouter
from backend.schemas import ChatRequest, ChatResponse
from backend.services.chat_service import chat_service

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_id = request.user_id or "anonymous"
    result = chat_service.get_response(request.message, user_id=user_id)
    return ChatResponse(**result)

import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.gemini_service import gemini_service
from app.utils.auth import get_current_active_user
from app.database import get_db
from app.models.models import User, ChatHistory
from app.agent.pending_store import get_pending, is_confirmation
from app.agent.executor import ToolExecutor

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
def ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Accept a user message. If there is a pending booking and the message is a
    confirmation keyword, execute the booking directly without calling Gemini.
    Otherwise, forward to Gemini for reasoning.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    message = request.message.strip()
    user_id = current_user.user_id

    # ----------------------------------------------------------------
    # FAST PATH: Pending booking confirmation — bypass Gemini entirely
    # ----------------------------------------------------------------
    pending = get_pending(user_id)
    if pending and pending.get("type") == "booking" and is_confirmation(message):
        logger.info(f"[PendingAction] User {user_id} confirmed booking. Executing directly.")

        executor = ToolExecutor(db, user_id)
        result_json = executor.execute_book_appointment_confirmed()
        result = json.loads(result_json)

        if result.get("success"):
            ai_response = (
                f"Your appointment has been confirmed!\n\n"
                f"**Doctor:** {result['doctor']}\n"
                f"**Date:** {result['date']}\n"
                f"**Time:** {result['time']}\n"
                f"**Token Number:** {result['token_number']}\n"
                f"**Queue Position:** {result['queue_position']}\n\n"
                f"Please arrive 15 minutes early and show your token number at the reception. "
                f"Is there anything else I can help you with?"
            )
        else:
            ai_response = f"I'm sorry, the booking could not be completed. {result.get('error', 'Please try again.')}"

        # Persist this exchange to chat history
        db.add(ChatHistory(user_id=user_id, user_message=message, ai_response=ai_response))
        db.commit()

        return ChatResponse(response=ai_response)

    # ----------------------------------------------------------------
    # NORMAL PATH: Send to Gemini for reasoning
    # ----------------------------------------------------------------
    ai_text = gemini_service.generate_chat_response(
        message=message,
        user_id=user_id,
        db=db
    )
    return ChatResponse(response=ai_text)


@router.get("/history")
def get_ai_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.user_id)
        .order_by(ChatHistory.created_at)
        .all()
    )
    result = []
    for h in history:
        result.append({"role": "user", "text": h.user_message, "timestamp": str(h.created_at)})
        result.append({"role": "ai",   "text": h.ai_response,  "timestamp": str(h.created_at)})
    return {"history": result}

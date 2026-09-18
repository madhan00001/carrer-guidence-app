"""
AI Career Chat API router.
Handles conversation, RAG context retrieval, MCP tool execution, and chat persistence.
"""

from datetime import datetime
from typing import List
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User, StudentProfile, ChatHistory
from backend.models.schemas import ChatRequest, ChatResponse
from backend.api.auth import get_current_user
from backend.services.ai_orchestrator import orchestrator

router = APIRouter(prefix="/api/chat", tags=["AI Career Chat"])

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    chat_in: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    student_data = {
        "name": user.name,
        "degree": profile.degree if profile else "B.Tech",
        "department": profile.department if profile else "Computer Science",
        "year": profile.year if profile else "3rd Year",
        "percentage": profile.percentage if profile else 8.0,
        "interests": profile.interests if profile else "",
        "career_goal": profile.career_goal if profile else "Software Developer",
        "skills": [s.skill_name for s in profile.skills] if profile else ["Python", "SQL"]
    }

    result = await orchestrator.process_student_query(
        question=chat_in.question,
        student_profile=student_data,
        target_career=chat_in.target_career,
        include_rag=chat_in.include_rag,
        include_mcp=chat_in.include_mcp
    )

    # Persist chat history
    history_record = ChatHistory(
        user_id=user.id,
        question=chat_in.question,
        response=result["response"],
        rag_context=json.dumps(result["rag_retrieved_chunks"]),
        mcp_tools_used=json.dumps(result["mcp_tools_invoked"])
    )
    db.add(history_record)
    db.commit()

    return ChatResponse(
        question=chat_in.question,
        response=result["response"],
        rag_retrieved_chunks=result["rag_retrieved_chunks"],
        mcp_tools_invoked=result["mcp_tools_invoked"],
        created_at=datetime.utcnow()
    )

@router.get("/history")
def get_chat_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "question": r.question,
            "response": r.response,
            "created_at": r.created_at
        }
        for r in records
    ]

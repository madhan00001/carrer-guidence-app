"""
Career Roadmap Generator API router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User, StudentProfile
from backend.models.schemas import RoadmapRequest, RoadmapResponse
from backend.api.auth import get_current_user
from mcp_server.tools.career_tools import generate_career_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])

@router.post("", response_model=RoadmapResponse)
def get_customized_roadmap(
    req: RoadmapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()

    student_data = {
        "name": user.name,
        "degree": profile.degree if profile else "B.Tech",
        "department": profile.department if profile else "Computer Science",
        "skills": req.current_skills or ([s.skill_name for s in profile.skills] if profile and profile.skills else ["Python", "SQL"])
    }

    result = generate_career_roadmap(student_data, req.target_career)
    if result.get("status") != "success":
        raise HTTPException(status_code=400, detail="Could not generate career roadmap")

    return RoadmapResponse(
        target_career=result["target_career"],
        timeframe_months=req.timeframe_months or 6,
        phases=result["phases"],
        personalized_notes=result["personalized_notes"]
    )

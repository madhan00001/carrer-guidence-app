"""
Skill Gap Analyzer API router.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User, StudentProfile
from backend.models.schemas import SkillGapRequest, SkillGapResponse
from backend.api.auth import get_current_user
from mcp_server.tools.career_tools import analyze_skill_gap

router = APIRouter(prefix="/api/skill-gap", tags=["Skill Gap Analyzer"])

@router.post("", response_model=SkillGapResponse)
def analyze_student_skill_gap(
    req: SkillGapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    
    # If skills were passed in request, use them; otherwise use saved profile skills
    skills_to_use = req.current_skills
    if not skills_to_use:
        skills_to_use = [s.skill_name for s in profile.skills] if profile and profile.skills else ["Python", "SQL"]

    result = analyze_skill_gap(skills_to_use, req.target_career)
    if result.get("status") != "success":
        raise HTTPException(status_code=400, detail=result.get("message", "Could not analyze skill gap"))

    return SkillGapResponse(
        target_career=result["target_career"],
        current_matched_skills=result["current_matched_skills"],
        skills_to_develop=result["missing_skills"],
        match_percentage=result["match_percentage"],
        structured_learning_sequence=result["structured_learning_sequence"]
    )

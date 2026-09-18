"""
Student Profile API endpoints.
Provides retrieval and updating of student profile, skills, and projects.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User, StudentProfile, Skill, Project
from backend.models.schemas import StudentProfileCreate, StudentProfileResponse, SkillBase, ProjectBase
from backend.api.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Student Profile"])

@router.get("", response_model=StudentProfileResponse)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=StudentProfileResponse)
def update_profile(profile_in: StudentProfileCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    # Update scalar fields
    profile.age = profile_in.age
    profile.degree = profile_in.degree
    profile.department = profile_in.department
    profile.year = profile_in.year
    profile.percentage = profile_in.percentage
    profile.interests = profile_in.interests
    profile.preferred_career_field = profile_in.preferred_career_field
    profile.career_goal = profile_in.career_goal
    profile.certifications = profile_in.certifications

    # Update skills if provided
    if profile_in.skills is not None:
        db.query(Skill).filter(Skill.student_id == profile.id).delete()
        for s in profile_in.skills:
            db.add(Skill(student_id=profile.id, skill_name=s.skill_name, skill_level=s.skill_level, category=s.category))

    # Update projects if provided
    if profile_in.projects is not None:
        db.query(Project).filter(Project.student_id == profile.id).delete()
        for p in profile_in.projects:
            db.add(Project(student_id=profile.id, project_name=p.project_name, description=p.description, technologies=p.technologies, project_url=p.project_url))

    db.commit()
    db.refresh(profile)
    return profile

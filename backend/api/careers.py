"""
Careers and Recommendation API router.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User, StudentProfile, CareerRole
from backend.models.schemas import CareerRoleResponse, CareerRecommendation
from backend.api.auth import get_current_user
from mcp_server.tools.career_tools import ROLE_MATRIX, TAXONOMY

router = APIRouter(prefix="/api/careers", tags=["Careers"])

@router.get("", response_model=List[dict])
def list_careers():
    """Returns all available career paths with metadata."""
    careers = []
    for key, data in ROLE_MATRIX.items():
        careers.append({
            "id": key,
            "slug": key,
            "role_name": data.get("title"),
            "mandatory_skills": data.get("mandatory_skills", []),
            "primary_languages": data.get("primary_languages", []),
            "database_skills": data.get("database_skills", []),
            "tools": data.get("tools", [])
        })
    return careers

@router.get("/recommendations", response_model=List[CareerRecommendation])
def get_career_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Analyzes student's education, skills, interests, projects, and goals
    to provide ranked career recommendations with transparent reasons.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    student_skills = [s.skill_name.lower().strip() for s in (profile.skills if profile else [])]
    interests_text = (profile.interests or "").lower() if profile else ""
    degree_text = (profile.department or "").lower() if profile else ""

    recommendations = []

    for role_key, role_data in ROLE_MATRIX.items():
        role_title = role_data.get("title")
        all_reqs = role_data.get("mandatory_skills", []) + role_data.get("primary_languages", []) + role_data.get("tools", [])
        
        matched_skills = []
        missing_skills = []
        reasons = []

        for req in all_reqs:
            req_lower = req.lower()
            if any(s in req_lower or req_lower in s for s in student_skills):
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        # Base match score from skills
        score = (len(matched_skills) / len(all_reqs) * 60) if all_reqs else 30

        if matched_skills:
            reasons.append(f"Matching technical skills: {', '.join(matched_skills[:3])}")

        # Interest alignment boost
        for word in role_title.lower().split():
            if len(word) > 3 and word in interests_text:
                score += 15
                reasons.append(f"Strong alignment with your interest in '{word}'")
                break

        # Department alignment boost
        if "computer" in degree_text and role_key in ["software_developer", "web_developer", "devops_engineer"]:
            score += 15
            reasons.append("Natural progression from your Computer Science degree")
        elif "data" in interests_text and "analyst" in role_key:
            score += 20
            reasons.append("Identified passion for analytical reasoning and data visualization")

        # Cap between 10% and 98%
        final_pct = min(98, max(15, int(score)))

        recommendations.append(CareerRecommendation(
            role_name=role_title,
            slug=role_key,
            match_percentage=final_pct,
            reasons=reasons if reasons else ["General foundational match based on your academic stage"],
            missing_skills=missing_skills[:4]
        ))

    # Sort descending by match percentage
    recommendations.sort(key=lambda r: r.match_percentage, reverse=True)
    return recommendations

@router.get("/{career_slug}")
def get_career_by_slug(career_slug: str):
    """Retrieve detailed profile for a specific career slug."""
    clean_slug = career_slug.lower().replace("-", "_")
    if clean_slug not in ROLE_MATRIX:
        raise HTTPException(status_code=404, detail="Career role not found")
    data = ROLE_MATRIX[clean_slug]
    return {
        "slug": clean_slug,
        "title": data.get("title"),
        "mandatory_skills": data.get("mandatory_skills", []),
        "primary_languages": data.get("primary_languages", []),
        "database_skills": data.get("database_skills", []),
        "tools": data.get("tools", [])
    }

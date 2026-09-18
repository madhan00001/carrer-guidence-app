"""
Pydantic schemas for request validation and API responses.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Skill & Project Schemas -----------------
class SkillBase(BaseModel):
    skill_name: str
    skill_level: str = "Intermediate"
    category: str = "Technical"

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    project_name: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    class Config:
        from_attributes = True

# ----------------- Student Profile Schemas -----------------
class StudentProfileBase(BaseModel):
    age: Optional[int] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    percentage: Optional[float] = None
    interests: Optional[str] = None
    preferred_career_field: Optional[str] = None
    career_goal: Optional[str] = None
    certifications: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    skills: Optional[List[SkillBase]] = []
    projects: Optional[List[ProjectBase]] = []

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []

    class Config:
        from_attributes = True

# ----------------- Career Schemas -----------------
class CareerSkillResponse(BaseModel):
    id: int
    skill_name: str
    importance: str

    class Config:
        from_attributes = True

class CareerRoleResponse(BaseModel):
    id: int
    role_name: str
    slug: str
    description: str
    salary_range: Optional[str] = None
    demand_level: str
    skills: List[CareerSkillResponse] = []

    class Config:
        from_attributes = True

class CareerRecommendation(BaseModel):
    role_name: str
    slug: str
    match_percentage: int
    reasons: List[str]
    missing_skills: List[str]

# ----------------- Skill Gap Schemas -----------------
class SkillGapRequest(BaseModel):
    target_career: str
    current_skills: Optional[List[str]] = None

class SkillGapResponse(BaseModel):
    target_career: str
    current_matched_skills: List[str]
    skills_to_develop: List[str]
    match_percentage: int
    structured_learning_sequence: List[str]

# ----------------- Roadmap Schemas -----------------
class RoadmapRequest(BaseModel):
    target_career: str
    current_skills: Optional[List[str]] = None
    timeframe_months: Optional[int] = 6

class RoadmapPhase(BaseModel):
    phase_name: str # e.g. "Month 1: Fundamentals"
    focus_area: str
    milestones: List[str]
    recommended_tools_or_courses: List[str]

class RoadmapResponse(BaseModel):
    target_career: str
    timeframe_months: int
    phases: List[RoadmapPhase]
    personalized_notes: str

# ----------------- Chat & AI Schemas -----------------
class ChatRequest(BaseModel):
    question: str
    target_career: Optional[str] = None
    include_rag: bool = True
    include_mcp: bool = True

class RAGChunk(BaseModel):
    source: str
    content: str
    score: float

class MCPToolExecution(BaseModel):
    tool_name: str
    parameters: dict
    result: dict

class ChatResponse(BaseModel):
    question: str
    response: str
    rag_retrieved_chunks: List[RAGChunk] = []
    mcp_tools_invoked: List[MCPToolExecution] = []
    created_at: datetime

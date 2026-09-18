"""
SQLAlchemy database models for Smart Career Guidance Assistant.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    degree = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    year = Column(String(20), nullable=True)
    percentage = Column(Float, nullable=True) # CGPA or Percentage
    interests = Column(Text, nullable=True)
    preferred_career_field = Column(String(100), nullable=True)
    career_goal = Column(String(100), nullable=True)
    certifications = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    skill_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced
    category = Column(String(50), default="Technical") # Technical, Programming Language, Soft Skill

    profile = relationship("StudentProfile", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    project_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String(255), nullable=True)
    project_url = Column(String(255), nullable=True)

    profile = relationship("StudentProfile", back_populates="projects")

class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    salary_range = Column(String(100), nullable=True)
    demand_level = Column(String(50), default="High")

    skills = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")

class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("career_roles.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    importance = Column(String(50), default="Mandatory") # Mandatory, Recommended, Optional

    career = relationship("CareerRole", back_populates="skills")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    rag_context = Column(Text, nullable=True)
    mcp_tools_used = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")

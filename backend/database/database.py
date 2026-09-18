"""
Database configuration using SQLite + SQLAlchemy.
Easily configurable to PostgreSQL or MySQL via DATABASE_URL environment variable.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./career_guidance.db")

# For SQLite, check_same_thread needs to be False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency injection helper for FastAPI routes to obtain a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

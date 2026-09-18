"""
Automated unit and integration test suite using Pytest and FastAPI TestClient.
Tests authentication, student profile, career recommendation, RAG, and MCP tools.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.database import Base, engine
from mcp_server.tools.career_tools import (
    search_career_roles,
    search_skills,
    search_courses,
    analyze_skill_gap,
    generate_career_roadmap
)

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown if needed

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Gemini" in data["technologies"]["llm"]

def test_mcp_search_career_roles():
    res = search_career_roles("Data Analyst")
    assert res["status"] == "success"
    assert len(res["results"]) >= 1
    assert "Data Analyst" in res["results"][0]["title"]

def test_mcp_search_skills():
    res = search_skills("Software Developer")
    assert res["status"] == "success"
    assert "Data Structures & Algorithms" in res["mandatory_skills"]

def test_mcp_search_courses():
    res = search_courses("SQL")
    assert res["status"] == "success"
    assert len(res["courses"]) > 0

def test_mcp_analyze_skill_gap():
    current_skills = ["Python", "SQL"]
    res = analyze_skill_gap(current_skills, "Data Analyst")
    assert res["status"] == "success"
    assert "Python" in res["current_matched_skills"]
    assert len(res["missing_skills"]) > 0

def test_mcp_generate_roadmap():
    student_profile = {
        "name": "Test Student",
        "skills": ["Python", "SQL"],
        "degree": "Computer Science"
    }
    res = generate_career_roadmap(student_profile, "Data Analyst")
    assert res["status"] == "success"
    assert len(res["phases"]) >= 4

def test_user_registration_and_login():
    test_email = "alex.student@college.edu"
    payload = {
        "name": "Alex Mercer",
        "email": test_email,
        "password": "Password123!"
    }
    # Register (or handle if already registered)
    reg_res = client.post("/api/auth/register", json=payload)
    if reg_res.status_code == 400: # already exists
        login_res = client.post("/api/auth/login", json={"email": test_email, "password": "Password123!"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
    else:
        assert reg_res.status_code == 200
        token = reg_res.json()["access_token"]

    assert token is not None

    # Test profile fetch with token
    headers = {"Authorization": f"Bearer {token}"}
    profile_res = client.get("/api/profile", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["career_goal"] is not None

def test_career_list_endpoint():
    res = client.get("/api/careers")
    assert res.status_code == 200
    careers = res.json()
    assert len(careers) >= 8

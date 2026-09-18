"""
MCP Career Tools Definition & Implementation.
Provides structured career utilities that can be called by an MCP client or AI agent.
"""

import json
import os
from typing import List, Dict, Any, Optional

# Load knowledge base catalogs
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TAXONOMY_PATH = os.path.join(BASE_DIR, "knowledge_base", "skills", "skills_taxonomy.json")
COURSES_PATH = os.path.join(BASE_DIR, "knowledge_base", "courses", "courses_catalog.json")
PROJECTS_PATH = os.path.join(BASE_DIR, "knowledge_base", "projects", "projects_catalog.json")

def _load_json(filepath: str, default: Any):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return default

TAXONOMY = _load_json(TAXONOMY_PATH, {"role_skill_matrix": {}})
COURSES = _load_json(COURSES_PATH, [])
PROJECTS = _load_json(PROJECTS_PATH, [])

ROLE_MATRIX = TAXONOMY.get("role_skill_matrix", {})

def search_career_roles(query: str) -> Dict[str, Any]:
    """
    Search career roles by keyword or title.
    Returns matched career role profiles, descriptions, and core skills.
    """
    query_lower = query.lower().strip().replace("-", "_").replace(" ", "_")
    results = []

    for role_key, role_data in ROLE_MATRIX.items():
        if query_lower in role_key or query_lower in role_data.get("title", "").lower():
            results.append({
                "role_key": role_key,
                "title": role_data.get("title"),
                "mandatory_skills": role_data.get("mandatory_skills", []),
                "primary_languages": role_data.get("primary_languages", []),
                "database_skills": role_data.get("database_skills", []),
                "tools": role_data.get("tools", [])
            })

    # If no exact match, return all available role titles
    if not results:
        available_roles = [r.get("title") for r in ROLE_MATRIX.values()]
        return {
            "status": "partial_match",
            "message": f"No exact match for '{query}'. Available career paths include: {', '.join(available_roles)}",
            "results": available_roles
        }

    return {
        "status": "success",
        "count": len(results),
        "results": results
    }

def search_skills(career_role: str) -> Dict[str, Any]:
    """
    Look up all required technical and soft skills for a given career role.
    """
    role_key = career_role.lower().strip().replace("-", "_").replace(" ", "_")
    
    # Try direct or substring lookup
    target_data = None
    for k, v in ROLE_MATRIX.items():
        if k == role_key or role_key in k or role_key in v.get("title", "").lower():
            target_data = v
            break

    if not target_data:
        return {
            "status": "not_found",
            "career_role": career_role,
            "message": f"Role '{career_role}' not found in career taxonomy."
        }

    all_technical = list(set(
        target_data.get("mandatory_skills", []) +
        target_data.get("primary_languages", []) +
        target_data.get("database_skills", []) +
        target_data.get("tools", [])
    ))

    soft_skills = ["Problem Solving", "Team Communication", "Analytical Thinking", "Continuous Learning"]

    return {
        "status": "success",
        "career_role": target_data.get("title"),
        "mandatory_skills": target_data.get("mandatory_skills", []),
        "programming_languages": target_data.get("primary_languages", []),
        "database_skills": target_data.get("database_skills", []),
        "tools_and_platforms": target_data.get("tools", []),
        "recommended_soft_skills": soft_skills,
        "all_technical_skills": all_technical
    }

def search_courses(skill_or_topic: str) -> Dict[str, Any]:
    """
    Retrieve curated courses and learning resources matching a skill or topic from local knowledge base.
    """
    query_lower = skill_or_topic.lower().strip()
    matched_courses = []

    for course in COURSES:
        title_match = query_lower in course.get("title", "").lower()
        skills_match = any(query_lower in s.lower() for s in course.get("skills", []))
        if title_match or skills_match:
            matched_courses.append(course)

    return {
        "status": "success",
        "query": skill_or_topic,
        "matched_count": len(matched_courses),
        "courses": matched_courses if matched_courses else COURSES[:3] # fallback to top 3
    }

def analyze_skill_gap(current_skills: List[str], target_career: str) -> Dict[str, Any]:
    """
    Compare student's current skills against target career requirements.
    Calculates missing skills, match percentage, and structured learning sequence.
    """
    role_info = search_skills(target_career)
    if role_info.get("status") != "success":
        return {
            "status": "error",
            "message": role_info.get("message", "Target career not recognized")
        }

    required_skills = role_info.get("all_technical_skills", [])
    current_normalized = {s.lower().strip(): s for s in current_skills}

    matched = []
    missing = []

    for req in required_skills:
        req_norm = req.lower().strip()
        # Direct check or partial token match
        found = False
        for cur_norm, cur_orig in current_normalized.items():
            if cur_norm in req_norm or req_norm in cur_norm:
                matched.append(req)
                found = True
                break
        if not found:
            missing.append(req)

    total = len(required_skills)
    match_pct = int((len(matched) / total) * 100) if total > 0 else 0

    # Structured learning sequence prioritizing foundation -> tools -> advanced
    learning_sequence = []
    # Priority 1: Languages
    for s in missing:
        if s in role_info.get("programming_languages", []):
            learning_sequence.append(f"Phase 1 (Language Foundation): {s}")
    # Priority 2: Core/Mandatory
    for s in missing:
        if s in role_info.get("mandatory_skills", []) and f"Phase 1 (Language Foundation): {s}" not in learning_sequence:
            learning_sequence.append(f"Phase 2 (Core Concepts): {s}")
    # Priority 3: Tools & DB
    for s in missing:
        if s in role_info.get("tools_and_platforms", []) or s in role_info.get("database_skills", []):
            learning_sequence.append(f"Phase 3 (Tools & Frameworks): {s}")

    return {
        "status": "success",
        "target_career": role_info.get("career_role"),
        "total_required_skills": total,
        "current_matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_pct,
        "structured_learning_sequence": learning_sequence if learning_sequence else ["All core skills acquired! Focus on portfolio projects."]
    }

def generate_career_roadmap(student_profile: Dict[str, Any], target_career: str) -> Dict[str, Any]:
    """
    Generate an actionable timeline roadmap (Beginner -> Intermediate -> Advanced -> Job Ready)
    customized by the student's existing skills and target career.
    """
    current_skills = student_profile.get("skills", [])
    gap_analysis = analyze_skill_gap(current_skills, target_career)
    missing = gap_analysis.get("missing_skills", [])

    phases = [
        {
            "phase_name": "Month 1: Foundations & Core Mechanics",
            "focus_area": "Closing foundational programming & theory gaps",
            "milestones": [
                f"Master core syntax: {missing[0] if len(missing) > 0 else 'Advanced programming idioms'}",
                "Review Git workflow, branch hygiene, and clean coding standards",
                "Solve 20 beginner-to-intermediate problem sets"
            ],
            "recommended_tools_or_courses": ["CS50 / FreeCodeCamp", "Git / GitHub CLI"]
        },
        {
            "phase_name": "Month 2: Deep Dive & Essential Tooling",
            "focus_area": "Tools, databases, and applied frameworks",
            "milestones": [
                f"Practice hands-on with: {missing[1] if len(missing) > 1 else 'SQL and relational database schema design'}",
                f"Implement automated unit tests and schema migrations",
                "Build first end-to-end module with proper error handling"
            ],
            "recommended_tools_or_courses": ["Coursera / Official Documentation", "Postman / Docker"]
        },
        {
            "phase_name": "Month 3: Capstone Projects & Architecture",
            "focus_area": "Portfolio building and system architecture",
            "milestones": [
                f"Develop a realistic project targeting {target_career}",
                "Containerize with Docker and write comprehensive README with architecture diagram",
                "Integrate CI/CD pipeline with automated checks"
            ],
            "recommended_tools_or_courses": ["GitHub Actions", "Docker Hub", "Vercel / Cloud Run"]
        },
        {
            "phase_name": "Month 4-5: Interview Preparation & Job Readiness",
            "focus_area": "Technical interview drills and resume optimization",
            "milestones": [
                "Polish resume highlighting STAR impact metrics and project links",
                "Conduct 5 mock technical interview sessions (System Design + Coding/Case Study)",
                "Optimize LinkedIn and GitHub profile with active contributions",
                "Apply to target internships and junior roles"
            ],
            "recommended_tools_or_courses": ["LeetCode / NeetCode", "Pramp / Interviewing.io", "STAR method framework"]
        }
    ]

    return {
        "status": "success",
        "student_name": student_profile.get("name", "Student"),
        "target_career": target_career,
        "match_percentage": gap_analysis.get("match_percentage", 0),
        "phases": phases,
        "personalized_notes": f"Roadmap generated based on student profile. Prioritizing: {', '.join(missing[:3]) if missing else 'Specialized portfolio projects'}."
    }

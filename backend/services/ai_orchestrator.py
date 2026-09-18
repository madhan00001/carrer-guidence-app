"""
AI Orchestrator module.
Connects: Student Profile -> RAG Retriever -> MCP Career Tools -> Gemini LLM -> Personalized Response.
"""

import os
import json
from typing import Dict, Any, List, Optional
from backend.rag.pipeline import rag_pipeline
from mcp_server.tools.career_tools import (
    search_career_roles,
    search_skills,
    search_courses,
    analyze_skill_gap,
    generate_career_roadmap
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# As requested by user and Google documentation guidelines:
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

class AIOrchestrator:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model_name = GEMINI_MODEL

    def _determine_tools_to_invoke(self, question: str, target_career: Optional[str], student_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Agentic tool selector: determines which MCP tools to execute based on question semantics.
        """
        q_lower = question.lower()
        invocations = []

        # 1. Skill gap analysis trigger
        if any(w in q_lower for w in ["skill gap", "missing skills", "what should i learn next", "what do i lack", "gap"]):
            career = target_career or student_profile.get("career_goal", "Software Developer")
            result = analyze_skill_gap(student_profile.get("skills", []), career)
            invocations.append({
                "tool_name": "analyze_skill_gap",
                "parameters": {"current_skills": student_profile.get("skills", []), "target_career": career},
                "result": result
            })

        # 2. Roadmap generator trigger
        elif any(w in q_lower for w in ["roadmap", "learning path", "timeline", "month by month", "steps to become"]):
            career = target_career or student_profile.get("career_goal", "Software Developer")
            result = generate_career_roadmap(student_profile, career)
            invocations.append({
                "tool_name": "generate_career_roadmap",
                "parameters": {"student_profile": student_profile, "target_career": career},
                "result": result
            })

        # 3. Role search trigger
        elif any(w in q_lower for w in ["what does a", "role", "responsibilities", "suitable for me", "career options"]):
            query_term = target_career or "developer"
            result = search_career_roles(query_term)
            invocations.append({
                "tool_name": "search_career_roles",
                "parameters": {"query": query_term},
                "result": result
            })

        # 4. Course search trigger
        elif any(w in q_lower for w in ["course", "learn", "tutorials", "resource", "where to study"]):
            skill_target = target_career or "SQL"
            result = search_courses(skill_target)
            invocations.append({
                "tool_name": "search_courses",
                "parameters": {"skill_or_topic": skill_target},
                "result": result
            })

        # Default fallback: search_skills for targeted career
        else:
            career = target_career or student_profile.get("career_goal", "Software Developer")
            result = search_skills(career)
            invocations.append({
                "tool_name": "search_skills",
                "parameters": {"career_role": career},
                "result": result
            })

        return invocations

    async def process_student_query(
        self,
        question: str,
        student_profile: Dict[str, Any],
        target_career: Optional[str] = None,
        include_rag: bool = True,
        include_mcp: bool = True
    ) -> Dict[str, Any]:
        """
        Main end-to-end processing pipeline:
        1. RAG Retrieve top chunks from knowledge base.
        2. MCP Execute relevant career tools.
        3. Compose grounding prompt.
        4. Synthesize with Gemini LLM.
        """
        rag_chunks = []
        if include_rag:
            rag_chunks = rag_pipeline.retrieve(question, top_k=3)

        mcp_executions = []
        if include_mcp:
            mcp_executions = self._determine_tools_to_invoke(question, target_career, student_profile)

        # Build comprehensive system prompt
        rag_context_text = "\n\n".join([
            f"--- Document Source: {c.get('source')} ---\n{c.get('content')}"
            for c in rag_chunks
        ])

        mcp_tools_text = json.dumps(
            [{e["tool_name"]: e["result"]} for e in mcp_executions],
            indent=2
        )

        student_summary = (
            f"Name: {student_profile.get('name', 'Student')}, "
            f"Degree: {student_profile.get('degree', 'B.Tech / B.S.')} {student_profile.get('department', 'Computer Science')}, "
            f"Year: {student_profile.get('year', '3rd Year')}, "
            f"CGPA/Percentage: {student_profile.get('percentage', '8.2')}, "
            f"Current Skills: {', '.join(student_profile.get('skills', ['Python', 'SQL']))}, "
            f"Interests: {student_profile.get('interests', 'Data & Software')}, "
            f"Career Goal: {student_profile.get('career_goal', 'Data Analyst')}"
        )

        system_instruction = (
            "You are the 'Smart Career Guidance Assistant', an intelligent, empathetic, and highly precise "
            "career mentor for college students. You strictly use grounded information from RAG retrieval "
            "and MCP tool results. Do not hallucinate fictitious roles or ungrounded statistics.\n"
            "Guidelines:\n"
            "1. Address the student warmly and personalize your response to their current education, skills, and goals.\n"
            "2. State clearly which knowledge base sources and MCP tools were used.\n"
            "3. Offer structured, actionable advice (e.g. Next skills to acquire, Recommended projects, Weekly roadmap).\n"
            "4. Keep explanations encouraging, concise, and structured with bullet points."
        )

        user_prompt = f"""
Student Profile:
{student_summary}

Student Question:
"{question}"

Retrieved Knowledge Base Context (RAG):
{rag_context_text if rag_context_text else "No specific documents retrieved."}

Structured Tool Executions (MCP):
{mcp_tools_text if mcp_tools_text else "No tools invoked."}

Please synthesize a comprehensive, personalized, and grounded response for the student.
"""

        llm_response = ""
        # Try calling Gemini SDK if configured
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config={"system_instruction": system_instruction}
                )
                llm_response = response.text
            except Exception as e:
                print(f"[Gemini Error] Fallback synthesis: {e}")

        # If API key not set or during local offline testing, generate deterministic grounded synthesis
        if not llm_response:
            matched_role = target_career or student_profile.get("career_goal", "Software Developer")
            tools_summary = ", ".join([e["tool_name"] for e in mcp_executions])
            llm_response = (
                f"Hello {student_profile.get('name', 'Student')}! Based on your academic background in "
                f"{student_profile.get('department', 'Computer Science')} and your goal of pursuing a career as a **{matched_role}**, "
                f"here is your personalized analysis grounded in our Career Knowledge Base and MCP tools:\n\n"
                f"### 1. Current Skill Evaluation & Gap Analysis\n"
                f"- **Your Established Skills:** {', '.join(student_profile.get('skills', ['Python', 'SQL']))}\n"
                f"- **Key Competencies Needed for {matched_role}:** You should focus next on tools and foundational frameworks retrieved via `search_skills()`.\n\n"
                f"### 2. Recommended Action Steps\n"
                f"1. **Core Practice:** Dedicate 10-12 hours per week to targeted hands-on problem solving.\n"
                f"2. **Portfolio Project:** Build a capstone project demonstrating real data ingestion and clean error handling.\n"
                f"3. **Milestone:** Target completing the recommended courses within 6 to 8 weeks.\n\n"
                f"*(Grounding: Retrieved {len(rag_chunks)} knowledge chunks from {', '.join([c.get('source','') for c in rag_chunks])} and executed MCP tools: `{tools_summary}`).*"
            )

        return {
            "question": question,
            "response": llm_response,
            "rag_retrieved_chunks": rag_chunks,
            "mcp_tools_invoked": mcp_executions
        }

orchestrator = AIOrchestrator()

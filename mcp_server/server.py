"""
Model Context Protocol (MCP) Server for Smart Career Guidance.
Exposes career tools via standard MCP specification and JSON-RPC.
"""

import sys
import json
import asyncio
from typing import Any, Dict
from mcp_server.tools.career_tools import (
    search_career_roles,
    search_skills,
    search_courses,
    analyze_skill_gap,
    generate_career_roadmap,
)

MCP_TOOLS = [
    {
        "name": "search_career_roles",
        "description": "Search career profiles and return required core competencies and overview.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Career name or keyword (e.g., 'Data Analyst', 'Web Developer')"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "search_skills",
        "description": "Look up required technical and soft skills for a given career role.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "career_role": {"type": "string", "description": "Exact or partial role name"}
            },
            "required": ["career_role"]
        }
    },
    {
        "name": "search_courses",
        "description": "Search curated learning resources and courses for a specific skill or topic.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "skill_or_topic": {"type": "string", "description": "Skill name (e.g., 'SQL', 'Docker', 'React')"}
            },
            "required": ["skill_or_topic"]
        }
    },
    {
        "name": "analyze_skill_gap",
        "description": "Compare student's current skills against a target career to get missing skills and match %.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "current_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of student's current skills"
                },
                "target_career": {"type": "string", "description": "Target job title"}
            },
            "required": ["current_skills", "target_career"]
        }
    },
    {
        "name": "generate_career_roadmap",
        "description": "Generate a personalized month-by-month learning roadmap tailored to student background.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "student_profile": {
                    "type": "object",
                    "description": "Student profile dictionary including current skills, degree, and goal"
                },
                "target_career": {"type": "string", "description": "Target job title"}
            },
            "required": ["student_profile", "target_career"]
        }
    }
]

def dispatch_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the requested tool and return structured result."""
    if tool_name == "search_career_roles":
        return search_career_roles(arguments.get("query", ""))
    elif tool_name == "search_skills":
        return search_skills(arguments.get("career_role", ""))
    elif tool_name == "search_courses":
        return search_courses(arguments.get("skill_or_topic", ""))
    elif tool_name == "analyze_skill_gap":
        return analyze_skill_gap(arguments.get("current_skills", []), arguments.get("target_career", ""))
    elif tool_name == "generate_career_roadmap":
        return generate_career_roadmap(arguments.get("student_profile", {}), arguments.get("target_career", ""))
    else:
        return {"error": f"Tool '{tool_name}' is not recognized."}

async def handle_stdio_rpc():
    """Stdio JSON-RPC handler for MCP integration."""
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            req_id = request.get("id")
            method = request.get("method")

            if method == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"tools": MCP_TOOLS}
                }
            elif method == "tools/call":
                params = request.get("params", {})
                name = params.get("name")
                args = params.get("arguments", {})
                result = dispatch_tool(name, args)
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": [{"type": "text", "text": json.dumps(result)}]}
                }
            else:
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method {method} not found"}
                }
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32603, "message": str(e)}
            }
            sys.stdout.write(json.dumps(err) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(handle_stdio_rpc())

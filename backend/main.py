"""
FastAPI Main Application Entry Point.
Smart Career Guidance Assistant Using LLM, RAG and MCP.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.database.database import engine, Base
from backend.api import auth, profile, careers, chat, skill_gap, roadmap

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Career Guidance Assistant API",
    description="Full-stack AI Career Guidance platform integrating Gemini LLM, LangChain RAG, and MCP career tools.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(careers.router)
app.include_router(chat.router)
app.include_router(skill_gap.router)
app.include_router(roadmap.router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "Smart Career Guidance API",
        "technologies": {
            "llm": "Gemini 3.8 Flash",
            "rag": "LangChain + ChromaDB",
            "mcp": "Python MCP Tools Server",
            "database": "SQLite + SQLAlchemy"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

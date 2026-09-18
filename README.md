# Smart Career Guidance Assistant Using LLM, RAG and MCP

An AI-powered career counseling and mentorship platform tailored for college and university students. The platform synthesizes student academic backgrounds, skills, interests, and career ambitions into personalized guidance using **Gemini LLM**, **LangChain + ChromaDB RAG (Retrieval-Augmented Generation)**, and **Model Context Protocol (MCP)** tools.

---

## 1. System Architecture

```text
                     ┌─────────────────────────────────────────┐
                     │          React + Vite Dashboard         │
                     │  Profile • AI Chat • Skill Gap • Roadmap │
                     └────────────────────┬────────────────────┘
                                          │ REST API / JWT
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │             Backend Server              │
                     │    FastAPI (Python) / Express (Node)    │
                     │   Auth • Profile • Careers • Chat APIs  │
                     └────────────────────┬────────────────────┘
                                          │
                     ┌────────────────────▼────────────────────┐
                     │            AI Orchestrator              │
                     └──────────────┬──────────────────┬───────┘
                                    │                  │
                         ┌──────────▼──────────┐       │
                         │    RAG Pipeline     │       ▼
                         │  LangChain/ChromaDB │  MCP Server Tools
                         │ Vector Search (Top-K)│ • search_career_roles
                         └──────────┬──────────┘ • search_skills
                                    │            • search_courses
                         ┌──────────▼──────────┐ • analyze_skill_gap
                         │  Career Knowledge   │ • generate_career_roadmap
                         │   Base Documents    │
                         └──────────┬──────────┘
                                    │
                                    └──────────┐
                                               ▼
                                      ┌──────────────────┐
                                      │ Gemini 3.8 Flash │
                                      │   (LLM Engine)   │
                                      └────────┬─────────┘
                                               │ Grounded Response
                                               ▼
                                      ┌──────────────────┐
                                      │ Student UI View  │
                                      └──────────────────┘
```

### Core Architecture Principles:
- **RAG (Knowledge Retrieval):** Fetches authoritative career profiles, curriculum benchmarks, and certification resources from `knowledge_base/careers/*.md` without relying solely on model internal memory.
- **MCP (Actionable Tools):** Exposes discrete, deterministic career operations (`search_career_roles`, `search_skills`, `search_courses`, `analyze_skill_gap`, `generate_career_roadmap`) using the Model Context Protocol standard.
- **Gemini LLM (Reasoning & Synthesis):** Uses `gemini-3.8-flash` via `@google/genai` to synthesize student profile context, retrieved RAG documents, and MCP tool calculations into structured, personalized career roadmaps.
- **SQLite Database:** Stores user credentials with bcrypt password hashing, student profiles, academic histories, skills, and chat histories.

---

## 2. Directory Structure

```text
smart-career-guidance/
├── frontend/ (src/)
│   ├── components/            # Reusable UI components (Cards, Navbar, Badges, Modals)
│   ├── pages/                 # Full dashboard pages
│   │   ├── Dashboard.tsx      # Overview, metrics, skill progress, recommendations
│   │   ├── Profile.tsx        # Student academic & skill management form
│   │   ├── ChatBot.tsx        # Conversational AI with RAG & MCP inspection
│   │   ├── CareerExplorer.tsx # 10+ career profiles & curriculum requirements
│   │   ├── SkillGap.tsx       # Gap analyzer with visual percentage match
│   │   ├── Roadmap.tsx        # Month-by-month actionable timeline
│   │   ├── ProjectsCatalog.tsx# Recommended portfolio projects
│   │   ├── Architecture.tsx   # Live RAG & MCP Pipeline Inspector
│   │   └── AuthModal.tsx      # Login & Registration modal
│   ├── services/api.ts        # Client API service layer
│   └── types.ts               # Shared TypeScript models
├── backend/
│   ├── main.py                # FastAPI entry point
│   ├── api/                   # REST routers (auth, profile, careers, chat, skill_gap, roadmap)
│   ├── database/database.py   # SQLAlchemy SQLite engine and sessions
│   ├── models/                # SQLAlchemy tables and Pydantic schemas
│   ├── rag/pipeline.py        # LangChain & ChromaDB retrieval pipeline
│   └── services/              # AI Orchestrator service
├── mcp_server/
│   ├── server.py              # Python MCP stdio JSON-RPC server
│   └── tools/career_tools.py  # 5 structured MCP career tools
├── knowledge_base/
│   ├── careers/               # Markdown knowledge base files (10 career domains)
│   ├── skills/                # skills_taxonomy.json
│   ├── courses/               # courses_catalog.json
│   └── projects/              # projects_catalog.json
├── scripts/
│   └── build_vector_db.py     # Script to re-index ChromaDB embeddings
├── tests/
│   └── test_api.py            # Pytest test suite
├── server.ts                  # Node.js/Express full-stack container server
├── requirements.txt           # Python dependencies
└── package.json               # Node.js dependencies & scripts
```

---

## 3. Database Schema (SQLite / PostgreSQL)

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | User ID |
| `name` | VARCHAR(100) | Student Full Name |
| `email` | VARCHAR(150) UNIQUE | Student Email |
| `password_hash` | VARCHAR(255) | Bcrypt hash |
| `created_at` | DATETIME | Timestamp |

### `student_profiles`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Profile ID |
| `user_id` | INTEGER FOREIGN KEY | Reference to users.id |
| `age` | INTEGER | Age |
| `degree` | VARCHAR(100) | Degree (e.g. B.Tech CSE) |
| `department` | VARCHAR(100) | Academic Department |
| `year` | VARCHAR(20) | Year of Study |
| `percentage` | FLOAT | CGPA / Percentage |
| `interests` | TEXT | Areas of Interest |
| `preferred_career_field` | VARCHAR(100) | Preferred Field |
| `career_goal` | VARCHAR(100) | Target Role |
| `certifications` | TEXT | Earned Certifications |

### `skills`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Skill ID |
| `student_id` | INTEGER FOREIGN KEY | Reference to student_profiles.id |
| `skill_name` | VARCHAR(100) | Skill Name |
| `skill_level` | VARCHAR(50) | Beginner / Intermediate / Advanced |
| `category` | VARCHAR(50) | Programming, Database, Tools, Soft |

### `chat_history`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | History ID |
| `user_id` | INTEGER FOREIGN KEY | Reference to users.id |
| `question` | TEXT | Student Query |
| `response` | TEXT | AI Grounded Response |
| `rag_context` | TEXT | JSON of retrieved RAG documents |
| `mcp_tools_used` | TEXT | JSON of MCP tool invocations |
| `created_at` | DATETIME | Timestamp |

---

## 4. MCP Tools Specification

1. **`search_career_roles`**
   - **Input:** `query: string`
   - **Output:** Role profile, overview, and core competencies.
2. **`search_skills`**
   - **Input:** `career_role: string`
   - **Output:** Technical, database, programming, and soft skills needed.
3. **`search_courses`**
   - **Input:** `skill_or_topic: string`
   - **Output:** Relevant courses, certifications, and resources.
4. **`analyze_skill_gap`**
   - **Input:** `current_skills: string[]`, `target_career: string`
   - **Output:** Matched skills, missing skills, match percentage, and ordered learning sequence.
5. **`generate_career_roadmap`**
   - **Input:** `student_profile: dict`, `target_career: string`
   - **Output:** 4-stage actionable learning timeline from Beginner to Job-Ready.

---

## 5. Quickstart & Installation

### Option A: Running the Full-Stack Web Application (Node + Vite)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# The application opens at http://localhost:3000
```

### Option B: Running the Python FastAPI Backend & MCP Server
```bash
# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Index the ChromaDB vector database
python scripts/build_vector_db.py

# Run FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Run Automated Test Suite
pytest tests/test_api.py -v
```

---

## 6. Sample Test Account Credentials

For instant evaluation and college viva demo:
- **Email:** `aditya@college.edu`
- **Password:** `student123`
- **Pre-loaded Profile:** Aditya Sharma, 3rd Year B.Tech CSE, 8.45 CGPA, skilled in Python, SQL, JavaScript, HTML5/CSS3, targeting **Data Analyst**.

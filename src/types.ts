export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Skill {
  id?: number;
  skill_name: string;
  skill_level: string; // Beginner, Intermediate, Advanced
  category: string;    // Programming, Database, Tools, Soft Skill, Frontend
}

export interface Project {
  id?: number;
  project_name: string;
  description: string;
  technologies: string;
  project_url: string;
}

export interface StudentProfile {
  id?: number;
  user_id?: number;
  age?: number;
  degree?: string;
  department?: string;
  year?: string;
  percentage?: number;
  interests?: string;
  preferred_career_field?: string;
  career_goal?: string;
  certifications?: string;
  skills: Skill[];
  projects: Project[];
}

export interface CareerRole {
  id: string;
  slug: string;
  role_name: string;
  mandatory_skills: string[];
  primary_languages: string[];
  database_skills: string[];
  tools: string[];
}

export interface CareerRecommendation {
  role_name: string;
  slug: string;
  match_percentage: number;
  reasons: string[];
  missing_skills: string[];
}

export interface SkillGapResult {
  target_career: string;
  total_required_skills: number;
  current_matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  structured_learning_sequence: string[];
}

export interface RoadmapPhase {
  phase_name: string;
  focus_area: string;
  milestones: string[];
  recommended_tools_or_courses: string[];
}

export interface CareerRoadmap {
  target_career: string;
  student_name: string;
  match_percentage: number;
  phases: RoadmapPhase[];
  personalized_notes: string;
}

export interface RAGChunk {
  source: string;
  role?: string;
  section?: string;
  content: string;
  score: number;
}

export interface MCPToolExecution {
  tool_name: string;
  parameters: any;
  result: any;
}

export interface ChatMessage {
  id?: string | number;
  role: "user" | "assistant";
  content: string;
  rag_chunks?: RAGChunk[];
  mcp_tools?: MCPToolExecution[];
  timestamp?: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  skills: string[];
  level: string;
  free: boolean;
  url: string;
  estimated_weeks: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  career_role: string;
  difficulty: string;
  skills: string[];
  description: string;
  deliverables: string[];
}

import {
  User,
  StudentProfile,
  CareerRole,
  CareerRecommendation,
  SkillGapResult,
  CareerRoadmap,
  ChatMessage,
  Course,
  PortfolioProject
} from "../types";

const TOKEN_KEY = "smart_career_jwt_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
    }
    let errorDetail = "Network request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // keep fallback errorDetail
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  getCurrentUser: () => request<User>("/api/auth/me"),

  // Profile
  getProfile: () => request<StudentProfile>("/api/profile"),
  updateProfile: (profile: Partial<StudentProfile>) =>
    request<StudentProfile>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    }),

  // Careers & Recommendations
  getCareers: () => request<CareerRole[]>("/api/careers"),
  getCareerRecommendations: () => request<CareerRecommendation[]>("/api/careers/recommendations"),
  getCareerBySlug: (slug: string) => request<CareerRole>(`/api/careers/${slug}`),

  // Skill Gap Analyzer
  analyzeSkillGap: (target_career: string, current_skills?: string[]) =>
    request<SkillGapResult>("/api/skill-gap", {
      method: "POST",
      body: JSON.stringify({ target_career, current_skills })
    }),

  // Roadmap
  getRoadmap: (target_career: string, current_skills?: string[], timeframe_months: number = 6) =>
    request<CareerRoadmap>("/api/roadmap", {
      method: "POST",
      body: JSON.stringify({ target_career, current_skills, timeframe_months })
    }),

  // Chat
  sendChatMessage: (question: string, target_career?: string, include_rag: boolean = true, include_mcp: boolean = true) =>
    request<{
      question: string;
      response: string;
      rag_retrieved_chunks: any[];
      mcp_tools_invoked: any[];
      created_at: string;
    }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question, target_career, include_rag, include_mcp })
    }),

  getChatHistory: () => request<Array<{ id: number; question: string; response: string; created_at: string }>>("/api/chat/history"),

  // Catalogs
  getCourses: () => request<Course[]>("/api/courses"),
  getProjects: () => request<PortfolioProject[]>("/api/projects"),

  // Health & Architecture Inspector
  getHealth: () => request<any>("/api/health"),
  getMCPTools: () => request<any>("/api/mcp/tools"),
  executeMCPTool: (tool_name: string, args: any) =>
    request<any>("/api/mcp/execute", {
      method: "POST",
      body: JSON.stringify({ tool_name, arguments: args })
    }),
  getRAGDocuments: () => request<any[]>("/api/rag/documents"),
  searchRAG: (query: string, top_k: number = 4) =>
    request<any>("/api/rag/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k })
    })
};

import fs from "fs";
import path from "path";

export interface CareerRoleData {
  id: string;
  slug: string;
  role_name: string;
  title: string;
  description: string;
  mandatory_skills: string[];
  primary_languages: string[];
  database_skills: string[];
  tools: string[];
  markdown_content?: string;
}

export interface CourseData {
  id: string;
  title: string;
  provider: string;
  skills: string[];
  level: string;
  free: boolean;
  url: string;
  estimated_weeks: number;
}

export interface ProjectData {
  id: string;
  title: string;
  career_role: string;
  difficulty: string;
  skills: string[];
  description: string;
  deliverables: string[];
}

export interface RAGDocumentChunk {
  source: string;
  role: string;
  section: string;
  content: string;
  text: string;
}

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), "knowledge_base");

export function loadSkillsTaxonomy(): { categories: any[]; role_skill_matrix: Record<string, any> } {
  try {
    const file = path.join(KNOWLEDGE_BASE_DIR, "skills", "skills_taxonomy.json");
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading taxonomy:", e);
  }
  return { categories: [], role_skill_matrix: {} };
}

export function loadCourses(): CourseData[] {
  try {
    const file = path.join(KNOWLEDGE_BASE_DIR, "courses", "courses_catalog.json");
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading courses:", e);
  }
  return [];
}

export function loadProjects(): ProjectData[] {
  try {
    const file = path.join(KNOWLEDGE_BASE_DIR, "projects", "projects_catalog.json");
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading projects:", e);
  }
  return [];
}

export function loadMarkdownKnowledgeBase(): RAGDocumentChunk[] {
  const chunks: RAGDocumentChunk[] = [];
  const careersDir = path.join(KNOWLEDGE_BASE_DIR, "careers");

  if (!fs.existsSync(careersDir)) return chunks;

  const files = fs.readdirSync(careersDir).filter(f => f.endsWith(".md"));
  for (const filename of files) {
    const filePath = path.join(careersDir, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    const sections = content.split("## ");
    const roleTitle = sections[0].replace("# Career Profile:", "").trim() || filename;

    for (let i = 1; i < sections.length; i++) {
      const sec = sections[i];
      const newlineIdx = sec.indexOf("\n");
      const header = (newlineIdx !== -1 ? sec.substring(0, newlineIdx) : sec).trim();
      const body = (newlineIdx !== -1 ? sec.substring(newlineIdx + 1) : "").trim();

      chunks.push({
        source: filename,
        role: roleTitle,
        section: header,
        content: `## ${header}\n${body}`,
        text: `${roleTitle} - ${header}: ${body}`
      });
    }
  }
  return chunks;
}

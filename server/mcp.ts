import { loadSkillsTaxonomy, loadCourses, loadProjects, CourseData, ProjectData } from "./data.js";

const taxonomy = loadSkillsTaxonomy();
const courses = loadCourses();
const projects = loadProjects();
const roleMatrix = taxonomy.role_skill_matrix || {};

export const MCP_TOOLS_METADATA = [
  {
    name: "search_career_roles",
    description: "Search career profiles and return required core competencies and overview.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Career name or keyword (e.g. 'Data Analyst', 'Cloud Engineer')" }
      },
      required: ["query"]
    }
  },
  {
    name: "search_skills",
    description: "Look up required technical and soft skills for a given career role.",
    inputSchema: {
      type: "object",
      properties: {
        career_role: { type: "string", description: "Target career role name" }
      },
      required: ["career_role"]
    }
  },
  {
    name: "search_courses",
    description: "Search curated learning resources and courses for a specific skill or topic.",
    inputSchema: {
      type: "object",
      properties: {
        skill_or_topic: { type: "string", description: "Skill name (e.g., 'SQL', 'Docker', 'React')" }
      },
      required: ["skill_or_topic"]
    }
  },
  {
    name: "analyze_skill_gap",
    description: "Compare student's current skills against a target career to get missing skills and match %.",
    inputSchema: {
      type: "object",
      properties: {
        current_skills: { type: "array", items: { type: "string" }, description: "List of student's current skills" },
        target_career: { type: "string", description: "Target job title" }
      },
      required: ["current_skills", "target_career"]
    }
  },
  {
    name: "generate_career_roadmap",
    description: "Generate a personalized month-by-month learning roadmap tailored to student background.",
    inputSchema: {
      type: "object",
      properties: {
        student_profile: { type: "object", description: "Student profile object" },
        target_career: { type: "string", description: "Target job title" }
      },
      required: ["student_profile", "target_career"]
    }
  }
];

export function mcpSearchCareerRoles(query: string) {
  const queryLower = (query || "").toLowerCase().trim().replace(/[-\s]+/g, "_");
  const results: any[] = [];

  for (const [roleKey, roleData] of Object.entries(roleMatrix)) {
    const title = (roleData as any).title || "";
    if (roleKey.includes(queryLower) || title.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        role_key: roleKey,
        title,
        mandatory_skills: (roleData as any).mandatory_skills || [],
        primary_languages: (roleData as any).primary_languages || [],
        database_skills: (roleData as any).database_skills || [],
        tools: (roleData as any).tools || []
      });
    }
  }

  if (results.length === 0) {
    const allTitles = Object.values(roleMatrix).map((r: any) => r.title);
    return {
      status: "partial_match",
      message: `No exact match for '${query}'. Available paths: ${allTitles.join(", ")}`,
      results: allTitles
    };
  }

  return {
    status: "success",
    count: results.length,
    results
  };
}

export function mcpSearchSkills(careerRole: string) {
  const roleKey = (careerRole || "").toLowerCase().trim().replace(/[-\s]+/g, "_");
  let targetData: any = null;

  for (const [k, v] of Object.entries(roleMatrix)) {
    const title = ((v as any).title || "").toLowerCase();
    if (k === roleKey || roleKey.includes(k) || k.includes(roleKey) || title.includes(careerRole.toLowerCase())) {
      targetData = v;
      break;
    }
  }

  if (!targetData) {
    return {
      status: "not_found",
      career_role: careerRole,
      message: `Role '${careerRole}' not found in career taxonomy.`
    };
  }

  const allTechnical = Array.from(new Set([
    ...(targetData.mandatory_skills || []),
    ...(targetData.primary_languages || []),
    ...(targetData.database_skills || []),
    ...(targetData.tools || [])
  ]));

  return {
    status: "success",
    career_role: targetData.title,
    mandatory_skills: targetData.mandatory_skills || [],
    programming_languages: targetData.primary_languages || [],
    database_skills: targetData.database_skills || [],
    tools_and_platforms: targetData.tools || [],
    recommended_soft_skills: ["Problem Solving", "Team Collaboration", "Analytical Thinking", "Continuous Learning"],
    all_technical_skills: allTechnical
  };
}

export function mcpSearchCourses(skillOrTopic: string) {
  const queryLower = (skillOrTopic || "").toLowerCase().trim();
  const matched = courses.filter(c => {
    const titleMatch = c.title.toLowerCase().includes(queryLower);
    const skillMatch = c.skills.some(s => s.toLowerCase().includes(queryLower));
    return titleMatch || skillMatch;
  });

  return {
    status: "success",
    query: skillOrTopic,
    matched_count: matched.length,
    courses: matched.length > 0 ? matched : courses.slice(0, 3)
  };
}

export function mcpAnalyzeSkillGap(currentSkills: string[], targetCareer: string) {
  const roleInfo = mcpSearchSkills(targetCareer);
  if (roleInfo.status !== "success") {
    return {
      status: "error",
      message: roleInfo.message || "Target career not recognized."
    };
  }

  const requiredSkills: string[] = roleInfo.all_technical_skills || [];
  const normalizedCurrent = (currentSkills || []).map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const reqLower = req.toLowerCase().trim();
    const found = normalizedCurrent.some(cur => cur.includes(reqLower) || reqLower.includes(cur));
    if (found) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const total = requiredSkills.length;
  const matchPercentage = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  const sequence: string[] = [];
  for (const s of missing) {
    if ((roleInfo.programming_languages || []).includes(s)) {
      sequence.push(`Phase 1 (Language Foundations): ${s}`);
    }
  }
  for (const s of missing) {
    if ((roleInfo.mandatory_skills || []).includes(s) && !sequence.some(x => x.includes(s))) {
      sequence.push(`Phase 2 (Core Concepts & Theory): ${s}`);
    }
  }
  for (const s of missing) {
    if (((roleInfo.tools_and_platforms || []).includes(s) || (roleInfo.database_skills || []).includes(s)) && !sequence.some(x => x.includes(s))) {
      sequence.push(`Phase 3 (Tools & Frameworks): ${s}`);
    }
  }

  return {
    status: "success",
    target_career: roleInfo.career_role,
    total_required_skills: total,
    current_matched_skills: matched,
    missing_skills: missing,
    match_percentage: matchPercentage,
    structured_learning_sequence: sequence.length > 0 ? sequence : ["All core skills verified! Focus on building high-impact capstone projects."]
  };
}

export function mcpGenerateCareerRoadmap(studentProfile: any, targetCareer: string) {
  const currentSkills = studentProfile?.skills || [];
  const gap = mcpAnalyzeSkillGap(currentSkills, targetCareer);
  const missing = gap.missing_skills || [];

  const phases = [
    {
      phase_name: "Month 1: Foundations & Core Mechanics",
      focus_area: "Closing foundational programming & theory gaps",
      milestones: [
        `Master core syntax: ${missing[0] || "Advanced programming idioms & functional patterns"}`,
        "Establish clean Git workflows, automated commit linting, and semantic branching",
        "Complete 20 foundational algorithmic problem sets"
      ],
      recommended_tools_or_courses: ["CS50 / FreeCodeCamp", "Git / GitHub CLI"]
    },
    {
      phase_name: "Month 2: Essential Tooling & Database Systems",
      focus_area: "Applied tools, databases, and architectural patterns",
      milestones: [
        `Hands-on lab with: ${missing[1] || "SQL, relational query execution plans, and schema design"}`,
        "Implement automated test suites with 80%+ test coverage",
        "Build a robust RESTful API with validation and JWT security"
      ],
      recommended_tools_or_courses: ["Coursera / Official Documentation", "Postman / Docker Compose"]
    },
    {
      phase_name: "Month 3: Production Capstone Project",
      focus_area: "Portfolio building and system architecture",
      milestones: [
        `Develop an end-to-end full-stack capstone aligned with ${targetCareer}`,
        "Containerize with multi-stage Dockerfiles and deploy with automated health probes",
        "Write an exhaustive technical README with architecture diagrams and API docs"
      ],
      recommended_tools_or_courses: ["GitHub Actions", "Docker Hub", "Cloud Run / Vercel"]
    },
    {
      phase_name: "Month 4-5: Interview Preparation & Job Readiness",
      focus_area: "Technical interview drills and resume optimization",
      milestones: [
        "Polish resume highlighting STAR impact metrics and live project URLs",
        "Complete 5 mock interviews (System Design + Coding + Behavioral)",
        "Optimize LinkedIn and GitHub profile with open source contributions",
        "Apply to target internships and campus placement drives"
      ],
      recommended_tools_or_courses: ["LeetCode / NeetCode 75", "Pramp / Interviewing.io", "STAR Method Guide"]
    }
  ];

  return {
    status: "success",
    student_name: studentProfile?.name || "Student",
    target_career: targetCareer,
    match_percentage: gap.match_percentage || 0,
    phases,
    personalized_notes: `Roadmap generated for ${studentProfile?.name || 'Student'}. Top skill priorities: ${missing.slice(0, 3).join(", ") || "Specialized system design"}.`
  };
}

export function executeMCPTool(toolName: string, args: any) {
  switch (toolName) {
    case "search_career_roles":
      return mcpSearchCareerRoles(args?.query || "");
    case "search_skills":
      return mcpSearchSkills(args?.career_role || "");
    case "search_courses":
      return mcpSearchCourses(args?.skill_or_topic || "");
    case "analyze_skill_gap":
      return mcpAnalyzeSkillGap(args?.current_skills || [], args?.target_career || "");
    case "generate_career_roadmap":
      return mcpGenerateCareerRoadmap(args?.student_profile || {}, args?.target_career || "");
    default:
      return { error: `Tool '${toolName}' not found.` };
  }
}

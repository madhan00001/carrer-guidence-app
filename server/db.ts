import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface DBUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface DBSkill {
  id: number;
  skill_name: string;
  skill_level: string;
  category: string;
}

export interface DBProject {
  id: number;
  project_name: string;
  description: string;
  technologies: string;
  project_url: string;
}

export interface DBStudentProfile {
  id: number;
  user_id: number;
  age: number;
  degree: string;
  department: string;
  year: string;
  percentage: number;
  interests: string;
  preferred_career_field: string;
  career_goal: string;
  certifications: string;
  skills: DBSkill[];
  projects: DBProject[];
}

export interface DBChatMessage {
  id: number;
  user_id: number;
  question: string;
  response: string;
  rag_chunks: any[];
  mcp_tools: any[];
  created_at: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "smart-career-secret-key-2026";

class DatabaseStore {
  private users: DBUser[] = [];
  private profiles: DBStudentProfile[] = [];
  private chatHistory: DBChatMessage[] = [];
  private nextUserId = 1;
  private nextProfileId = 1;
  private nextSkillId = 1;
  private nextProjectId = 1;
  private nextChatId = 1;

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed default student account
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("student123", salt);

    const defaultUser: DBUser = {
      id: this.nextUserId++,
      name: "Aditya Sharma",
      email: "aditya@college.edu",
      password_hash: hash,
      created_at: new Date().toISOString()
    };
    this.users.push(defaultUser);

    const defaultProfile: DBStudentProfile = {
      id: this.nextProfileId++,
      user_id: defaultUser.id,
      age: 21,
      degree: "B.Tech in Computer Science & Engineering",
      department: "Computer Science & Engineering",
      year: "3rd Year (Semester 6)",
      percentage: 8.45,
      interests: "Full-Stack Development, Data Analytics, Cloud Infrastructure, Machine Learning",
      preferred_career_field: "Software Engineering & Data Science",
      career_goal: "Data Analyst",
      certifications: "Google Foundations of Cybersecurity, freeCodeCamp Responsive Web Design",
      skills: [
        { id: this.nextSkillId++, skill_name: "Python", skill_level: "Intermediate", category: "Programming" },
        { id: this.nextSkillId++, skill_name: "SQL", skill_level: "Intermediate", category: "Database" },
        { id: this.nextSkillId++, skill_name: "JavaScript", skill_level: "Beginner", category: "Programming" },
        { id: this.nextSkillId++, skill_name: "HTML5 & CSS3", skill_level: "Intermediate", category: "Frontend" },
        { id: this.nextSkillId++, skill_name: "Problem Solving", skill_level: "Intermediate", category: "Soft Skill" },
        { id: this.nextSkillId++, skill_name: "Git", skill_level: "Beginner", category: "Tools" }
      ],
      projects: [
        {
          id: this.nextProjectId++,
          project_name: "College Placement Portal Analytics",
          description: "Exploratory analysis of 3-year campus recruitment drives with SQL queries and Python visualization.",
          technologies: "Python, Pandas, SQLite, Streamlit",
          project_url: "https://github.com/aditya/placement-analytics"
        },
        {
          id: this.nextProjectId++,
          project_name: "Student Task Tracker Web App",
          description: "Responsive task management tool with categories, due-date filters, and local persistence.",
          technologies: "React, Tailwind CSS, LocalStorage",
          project_url: "https://github.com/aditya/student-tracker"
        }
      ]
    };
    this.profiles.push(defaultProfile);
  }

  // Auth Operations
  public register(name: string, email: string, password: string): { user: DBUser; token: string } {
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user: DBUser = {
      id: this.nextUserId++,
      name,
      email,
      password_hash: hash,
      created_at: new Date().toISOString()
    };
    this.users.push(user);

    // Create default blank profile
    const profile: DBStudentProfile = {
      id: this.nextProfileId++,
      user_id: user.id,
      age: 20,
      degree: "B.Tech / B.S.",
      department: "Computer Science",
      year: "2nd Year",
      percentage: 8.0,
      interests: "Software Development",
      preferred_career_field: "Software Engineering",
      career_goal: "Software Developer",
      certifications: "",
      skills: [
        { id: this.nextSkillId++, skill_name: "Python", skill_level: "Intermediate", category: "Programming" },
        { id: this.nextSkillId++, skill_name: "SQL", skill_level: "Beginner", category: "Database" }
      ],
      projects: []
    };
    this.profiles.push(profile);

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  public login(email: string, password: string): { user: DBUser; token: string } {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  public generateToken(userId: number, email: string): string {
    return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "7d" });
  }

  public verifyToken(token: string): { sub: number; email: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  }

  public getUserById(id: number | string): DBUser | undefined {
    const numId = Number(id);
    if (isNaN(numId)) return undefined;
    return this.users.find(u => u.id === numId);
  }

  public getUserByEmail(email: string): DBUser | undefined {
    if (!email) return undefined;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getAllUsers(): DBUser[] {
    return this.users;
  }

  public getProfileByUserId(userId: number): DBStudentProfile | undefined {
    let profile = this.profiles.find(p => p.user_id === userId);
    if (!profile) {
      profile = {
        id: this.nextProfileId++,
        user_id: userId,
        age: 21,
        degree: "B.Tech",
        department: "Computer Science",
        year: "3rd Year",
        percentage: 8.0,
        interests: "Software Engineering",
        preferred_career_field: "Technology",
        career_goal: "Software Developer",
        certifications: "",
        skills: [],
        projects: []
      };
      this.profiles.push(profile);
    }
    return profile;
  }

  public updateProfile(userId: number, update: Partial<DBStudentProfile>): DBStudentProfile {
    const profile = this.getProfileByUserId(userId)!;
    
    if (update.age !== undefined) profile.age = update.age;
    if (update.degree !== undefined) profile.degree = update.degree;
    if (update.department !== undefined) profile.department = update.department;
    if (update.year !== undefined) profile.year = update.year;
    if (update.percentage !== undefined) profile.percentage = update.percentage;
    if (update.interests !== undefined) profile.interests = update.interests;
    if (update.preferred_career_field !== undefined) profile.preferred_career_field = update.preferred_career_field;
    if (update.career_goal !== undefined) profile.career_goal = update.career_goal;
    if (update.certifications !== undefined) profile.certifications = update.certifications;

    if (update.skills) {
      profile.skills = update.skills.map((s, idx) => ({
        id: s.id || this.nextSkillId++,
        skill_name: s.skill_name,
        skill_level: s.skill_level || "Intermediate",
        category: s.category || "Technical"
      }));
    }

    if (update.projects) {
      profile.projects = update.projects.map((p, idx) => ({
        id: p.id || this.nextProjectId++,
        project_name: p.project_name,
        description: p.description || "",
        technologies: p.technologies || "",
        project_url: p.project_url || ""
      }));
    }

    return profile;
  }

  // Chat History
  public addChatMessage(userId: number, question: string, response: string, ragChunks: any[], mcpTools: any[]): DBChatMessage {
    const msg: DBChatMessage = {
      id: this.nextChatId++,
      user_id: userId,
      question,
      response,
      rag_chunks: ragChunks,
      mcp_tools: mcpTools,
      created_at: new Date().toISOString()
    };
    this.chatHistory.unshift(msg);
    return msg;
  }

  public getChatHistory(userId: number): DBChatMessage[] {
    return this.chatHistory.filter(m => m.user_id === userId).slice(0, 30);
  }
}

export const dbStore = new DatabaseStore();

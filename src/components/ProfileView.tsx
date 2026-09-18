import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Award,
  FolderGit2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag
} from "lucide-react";
import { StudentProfile, Skill, Project } from "../types";
import { api } from "../services/api";

interface ProfileViewProps {
  profile: StudentProfile | null;
  onProfileUpdated: (updated: StudentProfile) => void;
}

const COMMON_SKILLS_SUGGESTIONS = [
  "Python",
  "SQL",
  "JavaScript",
  "React",
  "Data Structures & Algorithms",
  "Docker",
  "Git & GitHub",
  "PostgreSQL",
  "Tableau",
  "Power BI",
  "Linux",
  "Machine Learning",
  "System Design",
  "REST APIs"
];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    degree: "",
    department: "",
    year: "",
    percentage: 8.0,
    interests: "",
    preferred_career_field: "",
    career_goal: "",
    certifications: "",
    skills: [],
    projects: []
  });

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming");

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectTech, setNewProjectTech] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        degree: profile.degree || "",
        department: profile.department || "",
        year: profile.year || "",
        percentage: profile.percentage || 8.0,
        interests: profile.interests || "",
        preferred_career_field: profile.preferred_career_field || "",
        career_goal: profile.career_goal || "",
        certifications: profile.certifications || "",
        skills: profile.skills ? [...profile.skills] : [],
        projects: profile.projects ? [...profile.projects] : []
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await api.updateProfile(formData);
      onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (nameToAdd?: string) => {
    const name = nameToAdd || newSkillName;
    if (!name.trim()) return;

    // Avoid duplicates
    if (formData.skills?.some(s => s.skill_name.toLowerCase() === name.toLowerCase())) {
      setNewSkillName("");
      return;
    }

    const updatedSkills = [
      ...(formData.skills || []),
      {
        skill_name: name.trim(),
        skill_level: newSkillLevel,
        category: newSkillCategory
      }
    ];

    setFormData({ ...formData, skills: updatedSkills });
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    const updatedSkills = (formData.skills || []).filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const updatedProjects = [
      ...(formData.projects || []),
      {
        project_name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        technologies: newProjectTech.trim(),
        project_url: newProjectUrl.trim()
      }
    ];
    setFormData({ ...formData, projects: updatedProjects });
    setNewProjectName("");
    setNewProjectDesc("");
    setNewProjectTech("");
    setNewProjectUrl("");
  };

  const removeProject = (index: number) => {
    const updatedProjects = (formData.projects || []).filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Student Academic & Skill Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            This profile directly conditions the RAG vector search, MCP skill-gap calculations, and Gemini AI career recommendations.
          </p>
        </div>

        <button
          id="save-profile-btn"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Profile Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic Background */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>1. Academic Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Degree Program</label>
              <input
                type="text"
                value={formData.degree || ""}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. B.Tech / B.E. / B.S."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department / Specialization</label>
              <input
                type="text"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Year / Semester</label>
              <input
                type="text"
                value={formData.year || ""}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g. 3rd Year (Semester 6)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cumulative CGPA or Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.percentage ?? ""}
                onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 8.45"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Career Goals & Interests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>2. Ambitions & Interests</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Career Role</label>
              <select
                value={formData.career_goal || ""}
                onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="Software Developer">Software Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Web Developer">Web Developer (Full-Stack)</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Database Administrator">Database Administrator (DBA)</option>
                <option value="UI/UX Designer">UI/UX Designer & Frontend</option>
                <option value="Government & PSU Exams">Government & PSU Technical Exams</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Industry Sector</label>
              <input
                type="text"
                value={formData.preferred_career_field || ""}
                onChange={(e) => setFormData({ ...formData, preferred_career_field: e.target.value })}
                placeholder="e.g. FinTech, Enterprise SaaS, AI & Robotics"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Technical Interests & Passions</label>
              <input
                type="text"
                value={formData.interests || ""}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="e.g. Distributed Systems, Analytics Dashboards, Cloud Architecture, Machine Learning"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Completed Certifications</label>
              <input
                type="text"
                value={formData.certifications || ""}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="e.g. AWS Certified Cloud Practitioner, Google Data Analytics, HackerRank Python Gold"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Verified Skills Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>3. Technical & Soft Skills</span>
            </h2>
            <span className="text-xs text-slate-400">{formData.skills?.length || 0} skills active</span>
          </div>

          {/* Quick suggestions pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">Quick add from taxonomy:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS_SUGGESTIONS.map((skillName) => {
                const alreadyAdded = formData.skills?.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
                return (
                  <button
                    key={skillName}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addSkill(skillName)}
                    className={`px-2 py-0.5 text-xs rounded-md border transition ${
                      alreadyAdded
                        ? "bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed"
                        : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700"
                    }`}
                  >
                    + {skillName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add custom skill row */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Next.js, Kubernetes)"
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="w-full sm:w-36 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full sm:w-36 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="Programming">Programming</option>
              <option value="Database">Database</option>
              <option value="Tools">Tools</option>
              <option value="Frontend">Frontend</option>
              <option value="Cloud">Cloud</option>
              <option value="Soft Skill">Soft Skill</option>
            </select>
            <button
              type="button"
              onClick={() => addSkill()}
              className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Current Skills List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {formData.skills && formData.skills.length > 0 ? (
              formData.skills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl"
                >
                  <div>
                    <span className="text-xs font-medium text-slate-200">{s.skill_name}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-[10px] text-blue-400">{s.skill_level}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-3 py-2 italic">
                No skills added yet. Use the buttons above to record your skills.
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Projects & Portfolio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-teal-400" />
              <span>4. Academic & Portfolio Projects</span>
            </h2>
            <span className="text-xs text-slate-400">{formData.projects?.length || 0} projects</span>
          </div>

          {/* New Project Creator */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-300">Add a Project</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Title (e.g. Hospital EMR System)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newProjectTech}
                onChange={(e) => setNewProjectTech(e.target.value)}
                placeholder="Technologies used (e.g. Python, FastAPI, SQLite)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief description & key achievements"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 md:col-span-2"
              />
              <input
                type="text"
                value={newProjectUrl}
                onChange={(e) => setNewProjectUrl(e.target.value)}
                placeholder="GitHub Repo URL / Live Demo Link"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end items-center">
                <button
                  type="button"
                  onClick={addProject}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Projects List */}
          <div className="space-y-3 pt-2">
            {formData.projects && formData.projects.length > 0 ? (
              formData.projects.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{p.project_name}</h4>
                    <p className="text-xs text-slate-400">{p.description}</p>
                    <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
                      <span className="text-blue-400">Tech: {p.technologies}</span>
                      {p.project_url && (
                        <>
                          <span>•</span>
                          <a
                            href={p.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-400 hover:underline"
                          >
                            Repository
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No projects recorded yet.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

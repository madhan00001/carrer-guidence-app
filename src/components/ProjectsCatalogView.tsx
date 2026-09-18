import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  Code2,
  Layers,
  Award
} from "lucide-react";
import { PortfolioProject } from "../types";
import { api } from "../services/api";

interface ProjectsCatalogViewProps {
  onAskAI: (query: string) => void;
  onAddProjectToProfile: (project: PortfolioProject) => void;
}

export const ProjectsCatalogView: React.FC<ProjectsCatalogViewProps> = ({
  onAskAI,
  onAddProjectToProfile
}) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error loading projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const roles = ["All", ...Array.from(new Set(projects.map((p) => p.career_role)))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = projects.filter((p) => {
    const roleMatch = selectedRole === "All" || p.career_role === selectedRole;
    const diffMatch = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    return roleMatch && diffMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <FolderGit2 className="w-5 h-5 text-teal-400" />
              <span>Curated Portfolio Projects Catalog</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Recruiter-tested capstones categorized by domain and technical depth. Completing 2-3 of these significantly elevates your resume.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-400">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d} className="bg-slate-900">{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
          Loading project catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40">
                    {proj.career_role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      proj.difficulty === "Beginner"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : proj.difficulty === "Intermediate"
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-rose-950 text-rose-300 border-rose-800"
                    }`}
                  >
                    {proj.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>

                {/* Skills tags */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Technologies:</span>
                  <div className="flex flex-wrap gap-1">
                    {proj.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[11px] rounded border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400">Key Deliverables:</span>
                  <div className="space-y-1">
                    {proj.deliverables.map((d, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onAskAI(`How should I implement the '${proj.title}' project? Provide an architecture overview, step-by-step phases, and README template.`)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask AI How to Build</span>
                </button>

                <button
                  onClick={() => onAddProjectToProfile(proj)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                  title="Add to student profile"
                >
                  + Add to Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

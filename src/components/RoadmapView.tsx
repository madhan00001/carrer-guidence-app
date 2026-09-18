import React, { useState, useEffect } from "react";
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  Download,
  Share2,
  AlertCircle
} from "lucide-react";
import { StudentProfile, CareerRoadmap, CareerRole } from "../types";
import { api } from "../services/api";

interface RoadmapViewProps {
  profile: StudentProfile | null;
  careers: CareerRole[];
  selectedCareer?: string;
  onAskAI: (query: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  profile,
  careers,
  selectedCareer,
  onAskAI
}) => {
  const [targetRole, setTargetRole] = useState(selectedCareer || profile?.career_goal || "Data Analyst");
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCareer) {
      setTargetRole(selectedCareer);
    }
  }, [selectedCareer]);

  useEffect(() => {
    fetchRoadmap(targetRole);
  }, [targetRole, profile?.skills]);

  const fetchRoadmap = async (roleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const skills = profile?.skills?.map((s) => s.skill_name) || [];
      const res = await api.getRoadmap(roleName, skills, 6);
      setRoadmap(res);
    } catch (err: any) {
      console.error("Failed to load roadmap:", err);
      setError(err.message || "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Map className="w-5 h-5 text-blue-400" />
              <span>Personalized Career Learning Roadmap</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Generated via the <code className="text-teal-400 font-mono">generate_career_roadmap</code> MCP tool, custom tailored to your background.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Target Path:</span>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            >
              {careers.map((c) => (
                <option key={c.slug} value={c.role_name} className="bg-slate-900">
                  {c.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {roadmap && (
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200 leading-relaxed flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span>{roadmap.personalized_notes}</span>
          </div>
        )}
      </div>

      {/* Roadmap Timeline */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
          Generating milestone timeline and course dependencies...
        </div>
      ) : error ? (
        <div className="p-8 bg-red-950/30 border border-red-800/50 rounded-2xl text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-red-900/40 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs text-red-200 font-medium">{error}</p>
          <button
            onClick={() => fetchRoadmap(targetRole)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Retry Roadmap Generation
          </button>
        </div>
      ) : roadmap ? (
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-8 pl-6">
          {roadmap.phases.map((phase, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Marker Circle */}
              <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-[11px] font-bold text-blue-400 shadow-md">
                {idx + 1}
              </div>

              {/* Phase Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-700 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white">{phase.phase_name}</h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
                    Focus: {phase.focus_area}
                  </span>
                </div>

                {/* Milestones Checkbox List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-slate-300">Actionable Milestones:</span>
                  {phase.milestones.map((milestone, mIdx) => {
                    const mKey = `${idx}-${mIdx}`;
                    const isDone = !!completedMilestones[mKey];

                    return (
                      <div
                        key={mIdx}
                        onClick={() => toggleMilestone(mKey)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start space-x-3 transition select-none ${
                          isDone
                            ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
                            : "bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`leading-relaxed ${isDone ? "line-through text-slate-400" : ""}`}>
                          {milestone}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Recommended Tools & Courses */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">Recommended Courses & Tools:</span>
                    <div className="flex flex-wrap gap-1">
                      {phase.recommended_tools_or_courses.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[11px] border border-slate-800"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onAskAI(`How should I structure my learning for ${phase.phase_name} in ${targetRole}?`)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                  >
                    <span>Ask AI for tutorial plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

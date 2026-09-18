import React, { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  BookOpen,
  MapPin
} from "lucide-react";
import { StudentProfile, SkillGapResult, CareerRole } from "../types";
import { api } from "../services/api";

interface SkillGapViewProps {
  profile: StudentProfile | null;
  careers: CareerRole[];
  selectedCareer?: string;
  onGenerateRoadmap: (career: string) => void;
  onAskAI: (career: string) => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  profile,
  careers,
  selectedCareer,
  onGenerateRoadmap,
  onAskAI
}) => {
  const [targetRole, setTargetRole] = useState(selectedCareer || profile?.career_goal || "Data Analyst");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCareer) {
      setTargetRole(selectedCareer);
    }
  }, [selectedCareer]);

  useEffect(() => {
    fetchGapAnalysis(targetRole);
  }, [targetRole, profile?.skills]);

  const fetchGapAnalysis = async (roleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const skills = profile?.skills?.map((s) => s.skill_name) || [];
      const res = await api.analyzeSkillGap(roleName, skills);
      setResult(res);
    } catch (err: any) {
      console.error("Failed to analyze gap:", err);
      setError(err.message || "Failed to analyze skill gap");
    } finally {
      setLoading(false);
    }
  };

  const matchPct = result?.match_percentage ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Selector & Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Skill Gap & Readiness Analyzer</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Powered by the <code className="text-teal-400 font-mono">analyze_skill_gap</code> MCP tool, comparing your verified skills against industry benchmarks.
            </p>
          </div>

          {/* Role selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Target Role:</span>
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

        {/* Readiness Meter Card */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
            Executing MCP skill gap evaluation...
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-2xl text-center space-y-3">
            <div className="inline-flex p-2.5 rounded-full bg-red-900/40 text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-red-200 font-medium">{error}</p>
            <button
              onClick={() => fetchGapAnalysis(targetRole)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Retry Analysis
            </button>
          </div>
        ) : result ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 bg-slate-950 border border-slate-800/80 rounded-2xl p-6 text-center space-y-3">
              <span className="text-xs font-semibold text-slate-400">Match Percentage</span>
              <div className="relative inline-flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-8 border-slate-800 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{matchPct}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {result.current_matched_skills.length} of {result.total_required_skills} core competencies acquired
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-white">Summary for {result.target_career}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on your current coursework and projects, you have established strong proficiency in{" "}
                <span className="text-emerald-400 font-semibold">
                  {result.current_matched_skills.join(", ") || "fundamental engineering"}
                </span>
                . Closing the remaining {result.missing_skills.length} competencies will qualify you for junior & entry-level openings.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onGenerateRoadmap(result.target_career)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Generate Custom Roadmap</span>
                </button>
                <button
                  onClick={() => onAskAI(result.target_career)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Discuss Gap with AI Mentor</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Comparison Columns: Acquired vs Missing */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Skills You Have */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Skills (Acquired)</span>
              </h3>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-md text-[11px] font-bold border border-emerald-800/60">
                {result.current_matched_skills.length} Matched
              </span>
            </div>

            <div className="space-y-2">
              {result.current_matched_skills.length > 0 ? (
                result.current_matched_skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">{s}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-3">No direct overlap detected with this specific role yet.</p>
              )}
            </div>
          </div>

          {/* Column 2: Missing Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Skills To Develop (Gap)</span>
              </h3>
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded-md text-[11px] font-bold border border-amber-800/60">
                {result.missing_skills.length} Priority
              </span>
            </div>

            <div className="space-y-2">
              {result.missing_skills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">{s}</span>
                  </div>
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">
                    High Priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Structured Learning Sequence */}
      {result && result.structured_learning_sequence && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Recommended Learning Sequence (Dependency Order)</span>
          </h3>

          <div className="space-y-2.5">
            {result.structured_learning_sequence.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start space-x-3 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-slate-200 leading-relaxed font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

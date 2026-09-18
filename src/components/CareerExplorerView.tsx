import React, { useState } from "react";
import {
  Briefcase,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Database,
  Code,
  Layers,
  Sparkles,
  Award
} from "lucide-react";
import { CareerRole } from "../types";

interface CareerExplorerViewProps {
  careers: CareerRole[];
  currentGoal: string;
  onSetTargetCareer: (careerTitle: string) => void;
  onAnalyzeGap: (careerTitle: string) => void;
  onAskAI: (careerTitle: string) => void;
}

export const CareerExplorerView: React.FC<CareerExplorerViewProps> = ({
  careers,
  currentGoal,
  onSetTargetCareer,
  onAnalyzeGap,
  onAskAI
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState<CareerRole | null>(null);

  const filtered = careers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = c.role_name.toLowerCase().includes(q);
    const skillMatch = c.mandatory_skills.some((s) => s.toLowerCase().includes(q));
    const langMatch = c.primary_languages.some((l) => l.toLowerCase().includes(q));
    return titleMatch || skillMatch || langMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>Career Path Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore 10 industry career domains, benchmarked with real curriculum taxonomy and hiring requirements.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or skills (e.g. Python, Cloud)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((career) => {
          const isTarget = currentGoal.toLowerCase() === career.role_name.toLowerCase();

          return (
            <div
              key={career.id || career.slug}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                isTarget ? "border-blue-500/60 ring-1 ring-blue-500/30" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{career.role_name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{career.slug}</span>
                  </div>
                  {isTarget && (
                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-bold">
                      Your Goal
                    </span>
                  )}
                </div>

                {/* Mandatory Skills */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Core Mandatory Skills</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {career.mandatory_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[11px] rounded-md border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Languages & Tools */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-[11px] text-slate-500">Languages:</span>
                    <p className="text-[11px] text-slate-300 truncate">
                      {career.primary_languages.join(", ") || "Domain Specific"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Key Tools:</span>
                    <p className="text-[11px] text-slate-300 truncate">
                      {career.tools.join(", ") || "Standard Tooling"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onAnalyzeGap(career.role_name)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  Analyze Gap
                </button>

                {!isTarget ? (
                  <button
                    onClick={() => onSetTargetCareer(career.role_name)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                  >
                    Set as Goal
                  </button>
                ) : (
                  <button
                    onClick={() => onAskAI(career.role_name)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from "react";
import {
  Compass,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Layers,
  MapPin,
  MessageSquare
} from "lucide-react";
import { StudentProfile, CareerRecommendation, User } from "../types";
import { TabType } from "./Navbar";

interface DashboardViewProps {
  user: User | null;
  profile: StudentProfile | null;
  recommendations: CareerRecommendation[];
  onNavigate: (tab: TabType) => void;
  onSelectCareer: (careerSlug: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  profile,
  recommendations,
  onNavigate,
  onSelectCareer,
}) => {
  const currentGoal = profile?.career_goal || "Data Analyst";
  const matchedRec = recommendations.find(
    (r) => r.role_name.toLowerCase() === currentGoal.toLowerCase() || r.slug.includes(currentGoal.toLowerCase().replace(/\s+/g, "_"))
  );
  const matchPercentage = matchedRec ? matchedRec.match_percentage : 72;
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Student Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Career Guidance Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Enrolled in <span className="text-blue-300 font-medium">{profile?.degree || "B.Tech Computer Science"}</span>,{" "}
              {profile?.year || "3rd Year"} • CGPA: <span className="text-emerald-400 font-semibold">{profile?.percentage || "8.4"}</span>.
              Your target career path is set to <strong className="text-white font-semibold">{currentGoal}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-chat-btn"
              onClick={() => onNavigate("chat")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 flex items-center space-x-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Mentor</span>
            </button>
            <button
              id="dash-skillgap-btn"
              onClick={() => onNavigate("skill-gap")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 flex items-center space-x-2 transition"
            >
              <Target className="w-4 h-4 text-blue-400" />
              <span>Analyze Skill Gap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Target Career Match</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{matchPercentage}%</span>
            <span className="text-xs text-emerald-400 font-medium">Job Readiness</span>
          </div>
          <p className="mt-1 text-xs text-slate-400 truncate">For {currentGoal}</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Verified Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Skills</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{skillsCount}</span>
            <span className="text-xs text-slate-400">Recorded</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Across Programming & Tools</p>
          <div className="mt-3 flex items-center space-x-1">
            <button
              onClick={() => onNavigate("profile")}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>Manage skills</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Portfolio Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Portfolio Projects</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{projectsCount}</span>
            <span className="text-xs text-slate-400">Completed</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Documented in profile</p>
          <div className="mt-3 flex items-center space-x-1">
            <button
              onClick={() => onNavigate("projects")}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>Explore recommended</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: AI & RAG Corpus */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">RAG Knowledge Base</span>
            <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">10+</span>
            <span className="text-xs text-teal-400 font-medium">Career Profiles</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Curricula & Certifications</p>
          <div className="mt-3 flex items-center space-x-1">
            <button
              onClick={() => onNavigate("architecture")}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View RAG index</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recommended Careers & Current Skills Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Careers (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Ranked Career Recommendations</span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalized matches computed from your degree, skills, and declared interests
              </p>
            </div>
            <button
              onClick={() => onNavigate("careers")}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View all 10</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec, idx) => (
              <div
                key={rec.slug}
                className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                      #{idx + 1}
                    </span>
                    <h3 className="font-semibold text-sm text-white">{rec.role_name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        rec.match_percentage >= 70
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : rec.match_percentage >= 50
                          ? "bg-blue-950 text-blue-300 border-blue-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {rec.match_percentage}% Match
                    </span>
                    <button
                      onClick={() => {
                        onSelectCareer(rec.slug);
                        onNavigate("skill-gap");
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                    >
                      Analyze Gap
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  {rec.reasons.map((r, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {rec.missing_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400">Next Skills:</span>
                    {rec.missing_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-800/80 text-slate-300 text-[11px] rounded-md border border-slate-700/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Student Skills & Action Shortcuts */}
        <div className="space-y-6">
          {/* Active Skills Pillbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>My Acquired Skills</span>
              </h2>
              <button
                onClick={() => onNavigate("profile")}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                + Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    {skill.skill_name}
                    <span className="ml-1 text-[10px] text-slate-400">({skill.skill_level})</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No skills listed yet. Add some in your profile.</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => onNavigate("roadmap")}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center space-x-2"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Generate Customized Roadmap</span>
              </button>
            </div>
          </div>

          {/* Quick AI Prompts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Ask AI Mentor Now</span>
            </h3>
            <p className="text-xs text-slate-400">Try these popular questions grounded with RAG & MCP:</p>

            <div className="space-y-2">
              {[
                "What skills do I need to become a Data Analyst?",
                "What is my exact skill gap for Software Developer?",
                "What capstone project should I build next?",
              ].map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate("chat")}
                  className="w-full text-left p-2.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition flex items-center justify-between"
                >
                  <span className="truncate pr-2">"{promptText}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

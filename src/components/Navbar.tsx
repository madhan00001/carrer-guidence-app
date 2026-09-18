import React from "react";
import {
  Compass,
  User,
  MessageSquare,
  Briefcase,
  Target,
  Map,
  FolderGit2,
  Cpu,
  LogOut,
  Sparkles,
  Download
} from "lucide-react";
import { User as UserType } from "../types";

export type TabType =
  | "dashboard"
  | "profile"
  | "chat"
  | "careers"
  | "skill-gap"
  | "roadmap"
  | "projects"
  | "architecture";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    { id: "profile", label: "My Profile", icon: User },
    { id: "chat", label: "AI Mentor Chat", icon: MessageSquare },
    { id: "careers", label: "Career Explorer", icon: Briefcase },
    { id: "skill-gap", label: "Skill Gap", icon: Target },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "architecture", label: "RAG & MCP Inspector", icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            id="brand-logo"
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Smart Career Assistant
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                  LLM • RAG • MCP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Personalized Career Guidance & Skill Mapping
              </p>
            </div>
          </div>

          {/* User Auth and Export controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="/api/download-zip"
              download="smart-career-guidance-assistant.zip"
              id="download-code-zip-btn"
              title="Download Complete Project Source Code (.zip)"
              className="inline-flex items-center space-x-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 border border-emerald-700/50 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Download Code (.zip)</span>
              <span className="sm:hidden">.ZIP</span>
            </a>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <button
                  id="user-profile-button"
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 text-sm transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-slate-200 text-xs sm:text-sm font-medium hidden sm:inline">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs sm:text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

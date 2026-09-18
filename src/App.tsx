import React, { useState, useEffect } from "react";
import { Navbar, TabType } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { ProfileView } from "./components/ProfileView";
import { ChatView } from "./components/ChatView";
import { CareerExplorerView } from "./components/CareerExplorerView";
import { SkillGapView } from "./components/SkillGapView";
import { RoadmapView } from "./components/RoadmapView";
import { ProjectsCatalogView } from "./components/ProjectsCatalogView";
import { ArchitectureView } from "./components/ArchitectureView";
import { AuthModal } from "./components/AuthModal";
import { User, StudentProfile, CareerRole, CareerRecommendation, PortfolioProject } from "./types";
import { api, clearStoredToken } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string>("Data Analyst");
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial session & data
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch current user or default demo student
        const user = await api.getCurrentUser().catch(() => {
          clearStoredToken();
          return {
            id: 1,
            name: "Aditya Sharma",
            email: "aditya@college.edu"
          };
        });
        setCurrentUser(user);

        // Fetch profile
        const prof = await api.getProfile().catch(() => null);
        if (prof) {
          setProfile(prof);
          if (prof.career_goal) setSelectedCareer(prof.career_goal);
        }

        // Fetch careers catalog
        const careerList = await api.getCareers().catch(() => []);
        setCareers(careerList);

        // Fetch recommendations
        const recs = await api.getCareerRecommendations().catch(() => []);
        setRecommendations(recs);
      } catch (err) {
        console.error("Initial data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const refreshProfileAndRecs = async () => {
    try {
      const updatedProf = await api.getProfile();
      setProfile(updatedProf);
      const updatedRecs = await api.getCareerRecommendations();
      setRecommendations(updatedRecs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setCurrentUser(null);
    setProfile(null);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshProfileAndRecs();
  };

  const handleSetTargetCareer = async (careerTitle: string) => {
    setSelectedCareer(careerTitle);
    if (profile) {
      try {
        const updated = await api.updateProfile({ ...profile, career_goal: careerTitle });
        setProfile(updated);
        const updatedRecs = await api.getCareerRecommendations();
        setRecommendations(updatedRecs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAnalyzeGap = (careerTitle: string) => {
    setSelectedCareer(careerTitle);
    setActiveTab("skill-gap");
  };

  const handleGenerateRoadmap = (careerTitle: string) => {
    setSelectedCareer(careerTitle);
    setActiveTab("roadmap");
  };

  const handleAskAI = (careerOrQuery: string) => {
    setSelectedCareer(careerOrQuery);
    setActiveTab("chat");
  };

  const handleAddProjectToProfile = async (project: PortfolioProject) => {
    if (!profile) return;
    const existing = profile.projects || [];
    const alreadyExists = existing.some(p => p.project_name.toLowerCase() === project.title.toLowerCase());
    if (alreadyExists) return;

    const newProject = {
      project_name: project.title,
      description: project.description,
      technologies: project.skills.join(", "),
      project_url: "https://github.com/student/portfolio-capstone"
    };

    try {
      const updated = await api.updateProfile({
        ...profile,
        projects: [...existing, newProject]
      });
      setProfile(updated);
      setActiveTab("profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "dashboard" && (
          <DashboardView
            user={currentUser}
            profile={profile}
            recommendations={recommendations}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectCareer={(slug) => {
              const matched = careers.find(c => c.slug === slug);
              if (matched) setSelectedCareer(matched.role_name);
            }}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            profile={profile}
            onProfileUpdated={(updated) => {
              setProfile(updated);
              api.getCareerRecommendations().then(setRecommendations).catch(console.error);
            }}
          />
        )}

        {activeTab === "chat" && (
          <ChatView profile={profile} />
        )}

        {activeTab === "careers" && (
          <CareerExplorerView
            careers={careers}
            currentGoal={profile?.career_goal || "Data Analyst"}
            onSetTargetCareer={handleSetTargetCareer}
            onAnalyzeGap={handleAnalyzeGap}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === "skill-gap" && (
          <SkillGapView
            profile={profile}
            careers={careers}
            selectedCareer={selectedCareer}
            onGenerateRoadmap={handleGenerateRoadmap}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === "roadmap" && (
          <RoadmapView
            profile={profile}
            careers={careers}
            selectedCareer={selectedCareer}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === "projects" && (
          <ProjectsCatalogView
            onAskAI={handleAskAI}
            onAddProjectToProfile={handleAddProjectToProfile}
          />
        )}

        {activeTab === "architecture" && (
          <ArchitectureView />
        )}
      </main>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer with Project Badges */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Smart Career Guidance Assistant • College Capstone & Engineering Portfolio</p>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Gemini 3.8 Flash</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">LangChain RAG</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">MCP Protocol</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">SQLite + SQLAlchemy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

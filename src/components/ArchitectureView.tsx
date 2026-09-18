import React, { useState, useEffect } from "react";
import {
  Cpu,
  Database,
  Layers,
  Wrench,
  BookOpen,
  Play,
  CheckCircle2,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight
} from "lucide-react";
import { api } from "../services/api";

export const ArchitectureView: React.FC = () => {
  // System Health
  const [health, setHealth] = useState<any>(null);

  // MCP Tester
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("search_skills");
  const [toolArgs, setToolArgs] = useState<string>('{\n  "career_role": "Data Analyst"\n}');
  const [toolResult, setToolResult] = useState<any>(null);
  const [mcpLoading, setMcpLoading] = useState(false);

  // RAG Tester
  const [ragQuery, setRagQuery] = useState<string>("What certifications are recommended for Cloud Engineer?");
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [ragLoading, setRagLoading] = useState(false);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
    api.getMCPTools().then((data) => {
      if (data?.tools) setMcpTools(data.tools);
    }).catch(console.error);
  }, []);

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    if (toolName === "search_career_roles") {
      setToolArgs('{\n  "query": "Data Analyst"\n}');
    } else if (toolName === "search_skills") {
      setToolArgs('{\n  "career_role": "Software Developer"\n}');
    } else if (toolName === "search_courses") {
      setToolArgs('{\n  "skill_or_topic": "SQL"\n}');
    } else if (toolName === "analyze_skill_gap") {
      setToolArgs('{\n  "current_skills": ["Python", "SQL"],\n  "target_career": "Data Analyst"\n}');
    } else if (toolName === "generate_career_roadmap") {
      setToolArgs('{\n  "student_profile": {\n    "name": "Alex",\n    "skills": ["Python", "SQL"]\n  },\n  "target_career": "Data Analyst"\n}');
    }
  };

  const executeMCP = async () => {
    setMcpLoading(true);
    setToolResult(null);
    try {
      const parsed = JSON.parse(toolArgs);
      const res = await api.executeMCPTool(selectedTool, parsed);
      setToolResult(res);
    } catch (err: any) {
      setToolResult({ error: err.message || "Invalid JSON arguments" });
    } finally {
      setMcpLoading(false);
    }
  };

  const testRAGSearch = async () => {
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try {
      const res = await api.searchRAG(ragQuery, 3);
      setRagResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Title & Health Diagnostics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Pipeline & Architecture Diagnostics</span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>System Architecture: LLM + RAG + MCP Orchestration</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live inspection of the decoupled knowledge retrieval (RAG) and structured tool execution (MCP) layers.
            </p>
          </div>

          {health && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center space-x-4 text-xs">
              <div>
                <span className="text-slate-500 block">LLM Engine</span>
                <span className="font-semibold text-blue-400 font-mono">{health.architecture?.llm}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-500 block">RAG Chunks</span>
                <span className="font-semibold text-emerald-400 font-mono">{health.rag_indexed_chunks} indexed</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-500 block">MCP Server</span>
                <span className="font-semibold text-teal-400 font-mono">{health.mcp_tools_available} tools active</span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Architecture Flowchart */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-3">
            End-to-End Orchestration Workflow:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-blue-400 font-bold block">1. Student Profile</span>
              <p className="text-[11px] text-slate-400">Degree, CGPA, Verified Skills, Career Goal</p>
            </div>

            <div className="flex items-center justify-center text-slate-600">
              <ArrowRight className="w-5 h-5 hidden sm:block" />
              <span className="sm:hidden text-slate-500">▼</span>
            </div>

            <div className="p-3 bg-slate-900 border border-blue-900/60 rounded-xl space-y-1">
              <span className="text-teal-400 font-bold block">2. RAG & MCP Decoupling</span>
              <p className="text-[11px] text-slate-400">LangChain Chunks + Discrete MCP Tools</p>
            </div>

            <div className="flex items-center justify-center text-slate-600">
              <ArrowRight className="w-5 h-5 hidden sm:block" />
              <span className="sm:hidden text-slate-500">▼</span>
            </div>

            <div className="p-3 bg-slate-900 border border-purple-900/60 rounded-xl space-y-1">
              <span className="text-purple-400 font-bold block">3. Gemini 3.8 Flash</span>
              <p className="text-[11px] text-slate-400">Synthesizes Grounded, Actionable Guidance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Live Playground Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playground 1: Live MCP Tools Runner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white">Live MCP Tool Tester</h2>
            </div>
            <span className="text-[11px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-900">
              Model Context Protocol
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Select Tool:</label>
              <select
                value={selectedTool}
                onChange={(e) => handleToolChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500"
              >
                <option value="search_career_roles">search_career_roles(query)</option>
                <option value="search_skills">search_skills(career_role)</option>
                <option value="search_courses">search_courses(skill_or_topic)</option>
                <option value="analyze_skill_gap">analyze_skill_gap(current_skills, target_career)</option>
                <option value="generate_career_roadmap">generate_career_roadmap(student_profile, target_career)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Tool Input Arguments (JSON):</label>
              <textarea
                rows={4}
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={executeMCP}
              disabled={mcpLoading}
              className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{mcpLoading ? "Executing Tool..." : "Dispatch Tool via MCP"}</span>
            </button>

            {toolResult && (
              <div className="mt-3 space-y-1">
                <span className="text-[11px] text-slate-400">Structured Tool Response:</span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-teal-300 overflow-x-auto max-h-64">
                  {JSON.stringify(toolResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Playground 2: Live RAG Vector Search Playground */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Live RAG Vector Search</h2>
            </div>
            <span className="text-[11px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
              LangChain + ChromaDB
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Career Knowledge Search Query:</label>
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="e.g. What does a DevOps engineer do?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "Data Analyst requirements",
                "Cybersecurity certifications",
                "DevOps CI/CD tools",
                "Software Developer DSA"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setRagQuery(q)}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] rounded border border-slate-800"
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              onClick={testRAGSearch}
              disabled={ragLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{ragLoading ? "Searching Vectors..." : "Retrieve Top Chunks"}</span>
            </button>

            {ragResults.length > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-[11px] text-slate-400">Top Semantic Matches:</span>
                {ragResults.map((chunk, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-blue-400">
                      <span>Source: {chunk.source}</span>
                      <span>Score: {chunk.score}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

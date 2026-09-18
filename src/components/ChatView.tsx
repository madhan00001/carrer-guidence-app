import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  BookOpen,
  Wrench,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  Database,
  Cpu
} from "lucide-react";
import { ChatMessage, StudentProfile, RAGChunk, MCPToolExecution } from "../types";
import { api } from "../services/api";

interface ChatViewProps {
  profile: StudentProfile | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I am your **Smart Career Guidance Assistant**, powered by **Gemini LLM**, **LangChain RAG**, and **Model Context Protocol (MCP)** tools.

I have loaded your profile (${profile?.degree || "College Student"}, targeting **${profile?.career_goal || "Data Analyst"}**). 

How can I assist your career journey today? You can ask about:
- **Skill Gap Analysis:** "What skills do I lack for Data Analyst?"
- **Career Roadmap:** "Generate a 6-month learning timeline for me"
- **Project Recommendations:** "What capstone project will impress recruiters?"
- **Interview Prep:** "What are the core technical questions for my target role?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetCareer, setTargetCareer] = useState(profile?.career_goal || "Data Analyst");
  const [includeRAG, setIncludeRAG] = useState(true);
  const [includeMCP, setIncludeMCP] = useState(true);
  const [expandedProvenance, setExpandedProvenance] = useState<Record<number, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.career_goal) {
      setTargetCareer(profile.career_goal);
    }
  }, [profile?.career_goal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, targetCareer, includeRAG, includeMCP);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.response,
        rag_chunks: res.rag_retrieved_chunks,
        mcp_tools: res.mcp_tools_invoked,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error processing query: ${err.message || "Failed to reach AI service."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProvenance = (idx: number) => {
    setExpandedProvenance((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const suggestedPrompts = [
    `Analyze my skill gap for ${targetCareer}`,
    `Generate a step-by-step roadmap for ${targetCareer}`,
    "What portfolio projects should I build to get hired?",
    "Which online certifications are genuinely respected by employers?"
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Chat Top Header & Controls */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">AI Career Mentor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Model: <strong className="text-slate-300">Gemini 3.8 Flash</strong> • Grounded in Career RAG & MCP Tools
            </p>
          </div>
        </div>

        {/* Options & Filters */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Target:</span>
            <select
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none"
            >
              <option value="Data Analyst" className="bg-slate-900">Data Analyst</option>
              <option value="Software Developer" className="bg-slate-900">Software Developer</option>
              <option value="Web Developer" className="bg-slate-900">Web Developer</option>
              <option value="Data Scientist" className="bg-slate-900">Data Scientist</option>
              <option value="Cloud Engineer" className="bg-slate-900">Cloud Engineer</option>
              <option value="Cybersecurity Analyst" className="bg-slate-900">Cybersecurity Analyst</option>
              <option value="DevOps Engineer" className="bg-slate-900">DevOps Engineer</option>
              <option value="Database Administrator" className="bg-slate-900">Database Admin</option>
              <option value="UI/UX Designer" className="bg-slate-900">UI/UX Designer</option>
              <option value="Government & PSU Exams" className="bg-slate-900">Govt & PSU Exams</option>
            </select>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={includeRAG}
              onChange={(e) => setIncludeRAG(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="text-[11px] text-slate-300">RAG</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={includeMCP}
              onChange={(e) => setIncludeMCP(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="text-[11px] text-slate-300">MCP</span>
          </label>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const hasProvenance =
            !isUser &&
            ((msg.rag_chunks && msg.rag_chunks.length > 0) ||
              (msg.mcp_tools && msg.mcp_tools.length > 0));

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs ${
                  isUser
                    ? "bg-blue-600 shadow-md shadow-blue-600/30"
                    : "bg-slate-800 border border-slate-700 text-blue-400"
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[82%] space-y-2 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm whitespace-pre-wrap"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Grounding & Provenance Accordion */}
                {hasProvenance && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden text-left text-xs">
                    <button
                      onClick={() => toggleProvenance(idx)}
                      className="w-full px-3 py-2 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between text-slate-400 hover:text-slate-200 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold text-[11px] text-slate-300">
                          Execution Provenance ({msg.rag_chunks?.length || 0} RAG Chunks, {msg.mcp_tools?.length || 0} MCP Tools)
                        </span>
                      </div>
                      {expandedProvenance[idx] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedProvenance[idx] && (
                      <div className="p-3 space-y-3 border-t border-slate-800/80">
                        {/* RAG Chunks */}
                        {msg.rag_chunks && msg.rag_chunks.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-1.5 text-blue-400 font-semibold text-[11px] mb-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Retrieved Knowledge Base Chunks:</span>
                            </div>
                            <div className="space-y-1.5">
                              {msg.rag_chunks.map((c, i) => (
                                <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                                  <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                                    <span className="text-blue-300">{c.source}</span>
                                    <span>Score: {c.score}</span>
                                  </div>
                                  <p className="text-slate-300 line-clamp-2">{c.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MCP Tools */}
                        {msg.mcp_tools && msg.mcp_tools.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-1.5 text-teal-400 font-semibold text-[11px] mb-1.5">
                              <Wrench className="w-3.5 h-3.5" />
                              <span>MCP Tools Executed:</span>
                            </div>
                            <div className="space-y-1.5">
                              {msg.mcp_tools.map((t, i) => (
                                <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                                  <span className="text-teal-300 font-bold">{t.tool_name}()</span>
                                  <pre className="mt-1 text-[10px] text-slate-400 overflow-x-auto">
                                    {JSON.stringify(t.result, null, 2)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {msg.timestamp && (
                  <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200" />
              <span className="text-slate-300 text-xs ml-1">
                Consulting RAG vectors & executing MCP career tools...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Suggestions:</span>
        </span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs whitespace-nowrap border border-slate-800 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${targetCareer}, roadmap, projects, or skill gap...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

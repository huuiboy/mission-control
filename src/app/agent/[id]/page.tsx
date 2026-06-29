"use client";

import { motion } from "framer-motion";
import { Send, Phone, Info, Search, Settings, Sparkles, Zap, Waves, ArrowLeft } from "lucide-react";
import { useState, use } from "react";
import Link from "next/link";
import { SignalWave } from "@/components/SignalWave";

type AgentId = "claude" | "openclaw" | "hermes";

const agentConfigs: Record<AgentId, {
  name: string;
  icon: any;
  color: string;
  colorDim: string;
  model: string;
  status: string;
  description: string;
}> = {
  claude: {
    name: "Claude",
    icon: Sparkles,
    color: "var(--claude)",
    colorDim: "var(--claude-dim)",
    model: "claude-sonnet-4-6",
    status: "online",
    description: "Primary AI assistant for code analysis, design, and strategic problem-solving.",
  },
  openclaw: {
    name: "OpenClaw",
    icon: Zap,
    color: "var(--openclaw)",
    colorDim: "var(--openclaw-dim)",
    model: "not configured",
    status: "offline",
    description: "Specialized agent for task automation and workflow orchestration.",
  },
  hermes: {
    name: "Hermes",
    icon: Waves,
    color: "var(--hermes)",
    colorDim: "var(--hermes-dim)",
    model: "not configured",
    status: "offline",
    description: "Communication and notification handler for multi-channel delivery.",
  },
};

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: agentId } = use(params);
  const id = (agentId in agentConfigs ? agentId : "claude") as AgentId;
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I'm ready to help. What would you like to work on?" },
  ]);
  const [input, setInput] = useState("");

  const agent = agentConfigs[id];
  const Icon = agent.icon;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm processing your request..." },
      ]);
    }, 500);
  };

  return (
    <div className="flex h-screen flex-col bg-base overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-raised bg-surface/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-raised transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: agent.colorDim }}
              >
                <Icon size={24} style={{ color: agent.color }} />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">{agent.name}</h1>
                <p className="font-mono text-xs text-text-muted">{agent.model}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-raised transition-colors">
              <Search size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-raised transition-colors">
              <Phone size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-raised transition-colors">
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-raised/30">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                agent.status === "online" ? "bg-claude" : "bg-text-muted"
              }`}
            />
            <span className="font-mono text-xs text-text-secondary capitalize">
              {agent.status} · {agent.description}
            </span>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-raised transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </motion.header>

      {/* Chat area */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 space-y-6 px-6 py-8">
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl mb-6"
                style={{ background: agent.colorDim }}
              >
                <Icon size={48} style={{ color: agent.color }} />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-2">
                Welcome to {agent.name}
              </h2>
              <p className="font-body text-text-secondary max-w-md text-center mb-8">
                {agent.description}
              </p>
              <div className="w-full max-w-md grid grid-cols-2 gap-3">
                {["Code Review", "Architecture", "Debugging", "Documentation"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-lg border border-raised bg-base/40 px-4 py-3 text-sm font-body transition-colors hover:border-raised-2 hover:bg-raised/30"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                style={{
                  background: msg.role === "user" ? "var(--raised)" : agent.colorDim,
                }}
              >
                {msg.role === "assistant" ? (
                  <Icon size={16} style={{ color: agent.color }} />
                ) : (
                  <span className="font-display text-xs font-semibold">U</span>
                )}
              </div>
              <div
                className={`max-w-xl rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-raised text-text-primary"
                    : "bg-raised/40 text-text-secondary"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-raised bg-surface/50 backdrop-blur-sm px-6 py-4"
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1 rounded-xl border border-raised bg-base/40 px-4 py-3 transition-colors focus-within:border-raised-2 focus-within:ring-1 focus-within:ring-raised">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message..."
              className="w-full bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
              rows={1}
            />
          </div>
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-claude transition-colors hover:bg-claude/90"
          >
            <Send size={16} className="text-base" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

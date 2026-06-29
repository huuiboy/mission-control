"use client";

import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Zap, Waves, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const agents = [
  {
    id: "claude",
    name: "Claude",
    icon: Sparkles,
    color: "var(--claude)",
    colorDim: "var(--claude-dim)",
    status: "online",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    icon: Zap,
    color: "var(--openclaw)",
    colorDim: "var(--openclaw-dim)",
    status: "offline",
  },
  {
    id: "hermes",
    name: "Hermes",
    icon: Waves,
    color: "var(--hermes)",
    colorDim: "var(--hermes-dim)",
    status: "offline",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const isHome = pathname === "/";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-raised hover:bg-raised-2 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar overlay (mobile) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:static left-0 top-0 h-screen w-80 bg-surface border-r border-raised flex flex-col gap-4 p-4 z-40 lg:z-auto"
      >
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 px-2 py-4 border-b border-raised/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-claude to-hermes">
            <MessageSquare size={20} className="text-base" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold">Mission Control</h1>
            <p className="font-mono text-xs text-text-muted">Agent Hub</p>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isHome
                ? "bg-raised border border-claude/40 text-text-primary"
                : "text-text-secondary hover:bg-raised/50"
            }`}
          >
            <MessageSquare size={18} />
            <span className="font-display font-medium">Dashboard</span>
          </Link>
        </nav>

        {/* Agents */}
        <div className="space-y-2">
          <p className="px-4 font-display text-xs font-semibold tracking-wide text-text-muted">
            AGENTS
          </p>
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = pathname === `/agent/${agent.id}`;
            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive
                    ? "bg-raised border border-raised text-text-primary"
                    : "text-text-secondary hover:bg-raised/50"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full relative ${
                    isActive ? "ring-2" : "group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-offset-surface"
                  }`}
                  style={{
                    background: agent.colorDim,
                  }}
                >
                  <Icon size={18} style={{ color: agent.color }} />
                  {/* Status dot */}
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-surface ${
                      agent.status === "online" ? "bg-claude" : "bg-text-muted"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm">{agent.name}</p>
                  <p className="font-mono text-xs text-text-muted capitalize">
                    {agent.status}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-raised/50 pt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-raised/50 transition-colors font-display text-sm">
            <LogOut size={16} />
            Sign out
          </button>
          <p className="px-4 font-mono text-xs text-text-muted">
            v0.1.0 · Connected to 1/3 agents
          </p>
        </div>
      </motion.aside>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { Send, Sparkles, Terminal } from "lucide-react";
import { useState } from "react";
import { SignalWave } from "./SignalWave";
import { SpeechMicButton } from "./SpeechMicButton";

const quickActions = [
  { label: "New session", hint: "Start a fresh conversation" },
  { label: "Run in repo", hint: "Point Claude at a local project" },
  { label: "Review changes", hint: "Summarize a pending diff" },
];

const recentSessions = [
  { title: "Refactor auth middleware", time: "2h ago" },
  { title: "Draft Q3 roadmap doc", time: "yesterday" },
  { title: "Debug flaky CI test", time: "2 days ago" },
];

export function ClaudePanel() {
  const [waveState] = useState<"idle" | "active" | "thinking">("idle");
  const [input, setInput] = useState("");

  const appendTranscript = (transcript: string) => {
    setInput((current) => {
      const base = current.trimEnd();
      return base ? `${base} ${transcript}` : transcript;
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative col-span-1 overflow-hidden rounded-2xl border border-raised bg-surface lg:col-span-2"
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--claude)" }}
      />

      <div className="relative flex items-center justify-between border-b border-raised px-6 py-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--claude-dim)" }}
          >
            <Sparkles size={16} color="var(--claude)" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Claude
            </h2>
            <p className="font-mono text-xs text-text-muted">claude-sonnet-4-6 · connected</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-claude/30 bg-claude-dim px-3 py-1 font-mono text-xs text-claude">
          <span className="h-1.5 w-1.5 rounded-full bg-claude" />
          online
        </span>
      </div>

      <div className="relative px-6 pt-6">
        <SignalWave state={waveState} color="var(--claude)" height={72} />
      </div>

      <div className="relative grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-3">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            whileHover={{ y: -2 }}
            className="group rounded-xl border border-raised bg-base/40 p-4 text-left transition-colors hover:border-claude/40"
          >
            <span className="font-display text-sm font-medium text-text-primary">
              {action.label}
            </span>
            <span className="mt-1 block font-body text-xs text-text-muted">
              {action.hint}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="relative border-t border-raised px-6 py-4">
        <h3 className="mb-3 font-display text-xs font-medium tracking-wide text-text-muted">
          RECENT SESSIONS
        </h3>
        <div className="flex flex-col gap-1.5">
          {recentSessions.map((s) => (
            <button
              key={s.title}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised-2"
            >
              <span className="font-body text-sm text-text-secondary">{s.title}</span>
              <span className="font-mono text-xs text-text-muted">{s.time}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-t border-raised px-6 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-raised bg-base/60 px-4 py-3 transition-colors focus-within:border-claude/50">
          <Terminal size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Ask Claude or run a command…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <SpeechMicButton
            onTranscript={appendTranscript}
            title="Dictate into Claude"
            ariaLabel="Dictate into Claude"
            className="h-8 w-8"
            inactiveClassName="text-text-muted hover:bg-claude-dim hover:text-claude"
            activeClassName="bg-claude-dim text-claude"
          />
          <button
            aria-label="Send"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-claude-dim hover:text-claude"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

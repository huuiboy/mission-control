"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

type LogEntry = {
  time: string;
  source: "claude" | "system" | "openclaw" | "hermes";
  message: string;
};

const sourceColor: Record<LogEntry["source"], string> = {
  claude: "var(--claude)",
  system: "var(--text-muted)",
  openclaw: "var(--openclaw)",
  hermes: "var(--hermes)",
};

const logs: LogEntry[] = [
  { time: "10:42:01", source: "system", message: "Mission control initialized" },
  { time: "10:42:03", source: "claude", message: "Connected via Claude Code CLI bridge" },
  { time: "10:42:03", source: "system", message: "Waiting for OpenClaw connection" },
  { time: "10:42:03", source: "system", message: "Waiting for Hermes connection" },
];

export function LogFeed() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
      className="rounded-2xl border border-raised bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-raised px-5 py-3">
        <Activity size={14} className="text-text-muted" />
        <h3 className="font-display text-xs font-medium tracking-wide text-text-secondary">
          ACTIVITY LOG
        </h3>
      </div>
      <div className="scroll-thin max-h-40 overflow-y-auto px-5 py-3">
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex items-baseline gap-3 py-1 font-mono text-xs"
          >
            <span className="text-text-muted">{log.time}</span>
            <span
              className="w-16 shrink-0 uppercase"
              style={{ color: sourceColor[log.source] }}
            >
              {log.source}
            </span>
            <span className="text-text-secondary">{log.message}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

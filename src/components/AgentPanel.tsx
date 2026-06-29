"use client";

import { motion } from "framer-motion";
import { LucideIcon, Plug } from "lucide-react";
import { SignalWave } from "./SignalWave";

type AgentPanelProps = {
  name: string;
  model: string;
  color: string;
  colorDim: string;
  icon: LucideIcon;
  delay?: number;
};

export function AgentPanel({ name, model, color, colorDim, icon: Icon, delay = 0 }: AgentPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className="relative overflow-hidden rounded-2xl border border-raised bg-surface"
    >
      <div className="flex items-center justify-between border-b border-raised px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: colorDim }}
          >
            <Icon size={15} color={color} />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">
              {name}
            </h3>
            <p className="font-mono text-[11px] text-text-muted">{model}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-raised px-2.5 py-1 font-mono text-[11px] text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
          idle
        </span>
      </div>

      <div className="px-5 pt-4 opacity-50">
        <SignalWave state="idle" color={color} height={40} />
      </div>

      <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: colorDim }}
        >
          <Plug size={16} color={color} />
        </span>
        <p className="max-w-[220px] font-body text-sm text-text-secondary">
          Not connected yet
        </p>
        <button
          className="rounded-lg border border-raised px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:border-[var(--btn-color)] hover:text-[var(--btn-color)]"
          style={{ "--btn-color": color } as React.CSSProperties}
        >
          Connect {name}
        </button>
      </div>
    </motion.section>
  );
}

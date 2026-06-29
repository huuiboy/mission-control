"use client";

import { motion } from "framer-motion";
import { Sparkles, Waves, Plus } from "lucide-react";
import { ClaudePanel } from "@/components/ClaudePanel";
import { AgentPanel } from "@/components/AgentPanel";
import { LogFeed } from "@/components/LogFeed";

export default function Home() {
  return (
    <div className="bg-grid relative min-h-screen flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-raised bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-text-primary">
                Dashboard
              </h1>
              <p className="mt-1 font-body text-sm text-text-secondary">
                1 agent online, 1 awaiting configuration
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-lg bg-claude px-4 py-2 font-display font-medium text-base transition-colors hover:bg-claude/90"
            >
              <Plus size={16} />
              New Chat
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ClaudePanel />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <AgentPanel
              name="Hermes"
              model="not configured"
              color="var(--hermes)"
              colorDim="var(--hermes-dim)"
              icon={Waves}
              delay={0.18}
            />
          </div>
        </div>

        <div className="mt-5">
          <LogFeed />
        </div>
      </main>
    </div>
  );
}

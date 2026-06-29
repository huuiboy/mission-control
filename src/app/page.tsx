"use client";

import { Zap, Waves } from "lucide-react";
import { StatusBar } from "@/components/StatusBar";
import { ClaudePanel } from "@/components/ClaudePanel";
import { AgentPanel } from "@/components/AgentPanel";
import { LogFeed } from "@/components/LogFeed";

export default function Home() {
  return (
    <div className="bg-grid relative min-h-screen flex-1">
      <StatusBar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            Good to see you.
          </h1>
          <p className="mt-1 font-body text-sm text-text-secondary">
            One agent online, two waiting to be connected.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ClaudePanel />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <AgentPanel
              name="OpenClaw"
              model="not configured"
              color="var(--openclaw)"
              colorDim="var(--openclaw-dim)"
              icon={Zap}
              delay={0.1}
            />
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

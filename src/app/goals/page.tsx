"use client";

import { ListTodo } from "lucide-react";
import { GoalBoard } from "@/components/GoalBoard";

export default function GoalsPage() {
  return (
    <div className="bg-grid relative min-h-screen flex-1 overflow-auto">
      <header className="border-b border-raised bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Goals
            </h1>
            <p className="mt-1 font-body text-sm text-text-secondary">
              Track checklist tasks and snapshot them into your vault.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-claude/30 bg-claude-dim px-3 py-2 font-mono text-xs text-claude">
            <ListTodo size={14} />
            checkbox tasks
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <GoalBoard />
      </main>
    </div>
  );
}

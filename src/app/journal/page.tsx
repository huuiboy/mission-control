"use client";

import { BookText } from "lucide-react";
import { JournalEditor } from "@/components/JournalEditor";

export default function JournalPage() {
  return (
    <div className="bg-grid relative min-h-screen flex-1 overflow-auto">
      <header className="border-b border-raised bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Journal
            </h1>
            <p className="mt-1 font-body text-sm text-text-secondary">
              Write a daily note and append it to one file per day.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-hermes/30 bg-hermes-dim px-3 py-2 font-mono text-xs text-hermes">
            <BookText size={14} />
            daily notes
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <JournalEditor />
      </main>
    </div>
  );
}

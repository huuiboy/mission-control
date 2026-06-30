"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckSquare2, Send, Sparkles, Waves, BookText } from "lucide-react";
import { useState } from "react";
import { SignalWave } from "./SignalWave";
import { SpeechMicButton } from "./SpeechMicButton";

type HermesMemorySnapshot = {
  version: 1;
  updatedAt: string;
  rememberedFacts: string[];
  recentTopics: string[];
  recentMessages: Array<{
    at: string;
    role: "user" | "assistant";
    content: string;
    intent?: string;
  }>;
};

const quickActions = [
  { label: "Summarize today", hint: "Turn the last few hours into a clean recap" },
  { label: "Capture action items", hint: "Extract tasks from notes or chat" },
  { label: "Draft journal note", hint: "Write a daily note to the vault" },
];

const routes = [
  { label: "Goals", detail: "Checkbox tasks", icon: CheckSquare2 },
  { label: "Journal", detail: "Daily markdown", icon: BookText },
  { label: "Signal", detail: "Message routing", icon: ArrowUpRight },
];

export function HermesPanel() {
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [lastArtifacts, setLastArtifacts] = useState<Array<{ kind: string; filePath: string }>>([]);
  const [intent, setIntent] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>("openai");
  const [memory, setMemory] = useState<HermesMemorySnapshot>({
    version: 1,
    updatedAt: "",
    rememberedFacts: [],
    recentTopics: [],
    recentMessages: [],
  });

  const appendTranscript = (transcript: string) => {
    setInput((current) => {
      const base = current.trimEnd();
      return base ? `${base} ${transcript}` : transcript;
    });
  };

  const handleSubmit = async () => {
    const message = input.trim();
    if (!message || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/hermes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Hermes request failed (${response.status})`);
      }

      const data = (await response.json()) as {
        intent: string;
        reply: string;
        savedArtifacts: Array<{ kind: string; filePath: string }>;
        memory: HermesMemorySnapshot;
        provider?: string;
      };

      setIntent(data.intent);
      setLastReply(data.reply);
      setLastArtifacts(data.savedArtifacts ?? []);
      setProvider(data.provider ?? "openai");
      if (data.memory) {
        setMemory(data.memory);
      }
      setInput("");
    } catch (error) {
      setIntent("chat");
      setLastReply(
        error instanceof Error
          ? `Hermes could not save that right now: ${error.message}`
          : "Hermes could not save that right now."
      );
      setLastArtifacts([]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
      className="relative overflow-hidden rounded-2xl border border-raised bg-surface lg:col-span-1"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--hermes)" }}
      />

      <div className="relative flex items-center justify-between border-b border-raised px-6 py-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--hermes-dim)" }}
          >
            <Waves size={16} color="var(--hermes)" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Hermes
            </h2>
            <p className="font-mono text-xs text-text-muted">
              local bridge · ready to route notes
            </p>
          </div>
        </div>

        <span className="flex items-center gap-2 rounded-full border border-hermes/30 bg-hermes-dim px-3 py-1 font-mono text-xs text-hermes">
          <span className="h-1.5 w-1.5 rounded-full bg-hermes" />
          online
        </span>
      </div>

      <div className="relative px-6 pt-6">
        <SignalWave state="idle" color="var(--hermes)" height={72} />
      </div>

      <div className="relative grid grid-cols-1 gap-3 px-6 py-5">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.07, duration: 0.4 }}
            whileHover={{ y: -2 }}
            onClick={() => setInput(action.label)}
            className="rounded-xl border border-raised bg-base/40 p-4 text-left transition-colors hover:border-hermes/40"
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
        <div className="rounded-xl border border-raised bg-base/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-text-primary">
                Local memory
              </p>
              <p className="font-mono text-[11px] text-text-muted">
                Stored in your VPS vault and carried into the next Hermes request
              </p>
            </div>
            <span className="rounded-full border border-hermes/30 px-2 py-1 font-mono text-[11px] text-hermes">
              {memory.rememberedFacts.length} facts
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-raised bg-surface px-3 py-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                Remembered facts
              </p>
              <ul className="space-y-1">
                {memory.rememberedFacts.length ? (
                  memory.rememberedFacts.slice(0, 3).map((fact) => (
                    <li key={fact} className="font-body text-sm text-text-secondary">
                      {fact}
                    </li>
                  ))
                ) : (
                  <li className="font-body text-sm text-text-muted">
                    No facts stored yet.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-raised bg-surface px-3 py-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                Recent topics
              </p>
              <ul className="space-y-1">
                {memory.recentTopics.length ? (
                  memory.recentTopics.slice(0, 3).map((topic) => (
                    <li key={topic} className="font-body text-sm text-text-secondary">
                      {topic}
                    </li>
                  ))
                ) : (
                  <li className="font-body text-sm text-text-muted">
                    No topics stored yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-raised px-6 py-4">
        <h3 className="mb-3 font-display text-xs font-medium tracking-wide text-text-muted">
          ROUTING TARGETS
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <div
                key={route.label}
                className="flex items-center gap-3 rounded-xl border border-raised bg-base/40 px-3 py-3"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "var(--hermes-dim)" }}
                >
                  <Icon size={15} color="var(--hermes)" />
                </span>
                <div>
                  <p className="font-display text-sm font-medium text-text-primary">
                    {route.label}
                  </p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {route.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative border-t border-raised px-6 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-raised bg-base/60 px-4 py-3 transition-colors focus-within:border-hermes/50">
          <Sparkles size={16} className="text-text-muted" />
          <input
            type="text"
            placeholder="Ask Hermes to summarize, route, or capture something…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <SpeechMicButton
            onTranscript={appendTranscript}
            title="Dictate into Hermes"
            ariaLabel="Dictate into Hermes"
            className="h-8 w-8"
            inactiveClassName="text-text-muted hover:bg-hermes-dim hover:text-hermes"
            activeClassName="bg-hermes-dim text-hermes"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-hermes-dim hover:text-hermes disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send to Hermes"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {(lastReply || lastArtifacts.length > 0) && (
        <div className="relative border-t border-raised px-6 py-4">
          <div className="rounded-xl border border-hermes/20 bg-hermes-dim/30 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-display text-sm font-semibold text-text-primary">
                Hermes response
              </p>
              <div className="flex items-center gap-2">
                {provider && (
                  <span className="rounded-full border border-raised px-2 py-1 font-mono text-[11px] text-text-muted">
                    {provider}
                  </span>
                )}
                {intent && (
                  <span className="rounded-full border border-hermes/30 px-2 py-1 font-mono text-[11px] text-hermes">
                    {intent}
                  </span>
                )}
              </div>
            </div>
            {lastReply && (
              <p className="whitespace-pre-wrap font-body text-sm text-text-secondary">
                {lastReply}
              </p>
            )}
            {lastArtifacts.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-wide text-text-muted">
                  Saved files
                </p>
                {lastArtifacts.map((artifact) => (
                  <div
                    key={artifact.filePath}
                    className="rounded-lg border border-raised bg-base/40 px-3 py-2"
                  >
                    <p className="font-mono text-[11px] text-text-muted">
                      {artifact.kind}
                    </p>
                    <p className="break-all font-mono text-[11px] text-text-secondary">
                      {artifact.filePath}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}

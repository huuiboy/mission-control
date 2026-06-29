"use client";

import { motion } from "framer-motion";
import { CheckSquare2, CirclePlus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SpeechMicButton } from "./SpeechMicButton";
import { saveAgenticOsEntry } from "@/lib/agentic-os-client";
import { getLocalDateInputValue, makeTimestampFromDateInput } from "@/lib/agentic-os-shared";

type Task = {
  id: string;
  text: string;
  done: boolean;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTasks(input: string) {
  return input
    .split(/\n|;|•/g)
    .map((item) => item.trim())
    .map((item) => item.replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

export function GoalBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [snapshotDate, setSnapshotDate] = useState(getLocalDateInputValue());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedFile, setLastSavedFile] = useState<string | null>(null);
  const lastSavedSignatureRef = useRef("");
  const saveTimerRef = useRef<number | null>(null);
  const hasEditedRef = useRef(false);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.done).length,
    [tasks]
  );

  const buildSnapshot = () => {
    const body = tasks.length
      ? tasks
          .map((task) => `- [${task.done ? "x" : " "}] ${task.text}`)
          .join("\n")
      : "- [ ] No goals added yet";

    const signature = JSON.stringify({
      snapshotDate,
      tasks: tasks.map((task) => ({ text: task.text, done: task.done })),
    });

    return { body, signature };
  };

  const addTasks = () => {
    const entries = normalizeTasks(draft);
    if (!entries.length) return;

    hasEditedRef.current = true;
    setTasks((current) => [
      ...entries.map((text) => ({
        id: createId(),
        text,
        done: false,
      })),
      ...current,
    ]);
    setDraft("");
  };

  const saveSnapshot = async () => {
    const { body, signature } = buildSnapshot();
    setIsSaving(true);
    try {
      const result = await saveAgenticOsEntry({
        kind: "goal",
        source: "goals-page",
        title: `Goals · ${snapshotDate}`,
        timestamp: makeTimestampFromDateInput(snapshotDate),
        body,
      }, { mode: "replace" });
      setLastSavedFile(result.filePath);
      lastSavedSignatureRef.current = signature;
    } finally {
      setIsSaving(false);
    }
  };

  const appendTranscript = (transcript: string) => {
    setDraft((current) => {
      const base = current.trimEnd();
      return base ? `${base} ${transcript}` : transcript;
    });
  };

  useEffect(() => {
    if (!hasEditedRef.current) return;

    const { signature } = buildSnapshot();
    if (signature === lastSavedSignatureRef.current) return;
    if (!tasks.length && !lastSavedSignatureRef.current) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void saveSnapshot();
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, snapshotDate]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-raised bg-surface"
    >
      <div className="flex items-center justify-between border-b border-raised px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-claude-dim">
            <CheckSquare2 size={18} color="var(--claude)" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Goals
            </h2>
            <p className="font-mono text-xs text-text-muted">
              Checklist tasks saved to your Obsidian vault
            </p>
          </div>
        </div>

        <div className="rounded-full border border-raised px-3 py-1 text-right">
          <p className="font-mono text-[11px] text-text-muted">
            {tasks.length} tasks · {completedCount} complete
          </p>
        </div>
      </div>

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <label className="mb-2 block font-display text-xs font-semibold tracking-wide text-text-muted">
              ADD TASKS
            </label>
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    addTasks();
                  }
                }}
                placeholder="Type a task, or dictate one with the mic…"
                rows={3}
                className="w-full resize-none rounded-xl border border-raised bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SpeechMicButton
                    onTranscript={appendTranscript}
                    title="Dictate a goal"
                    ariaLabel="Dictate a goal"
                    className="h-9 w-9 rounded-lg border border-raised bg-base/40 text-text-muted hover:bg-raised-2 hover:text-text-primary"
                    activeClassName="border-claude/40 bg-claude-dim text-claude"
                  />
                  <p className="font-mono text-[11px] text-text-muted">
                    Press Enter to add tasks one at a time.
                  </p>
                </div>

                <button
                  onClick={addTasks}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-claude px-4 py-2 font-display text-sm font-semibold text-base transition-colors hover:bg-claude/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CirclePlus size={16} />
                  Add task
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-text-primary">
                Current checklist
              </h3>
              <span className="font-mono text-[11px] text-text-muted">
                saved as markdown checkboxes
              </span>
            </div>

            <div className="space-y-2">
              {tasks.length ? (
                tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 rounded-xl border border-raised bg-surface px-3 py-3 transition-colors hover:border-claude/30"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => {
                        setTasks((current) =>
                          current.map((item) =>
                            item.id === task.id ? { ...item, done: !item.done } : item
                          )
                        );
                      }}
                      className="mt-1 h-4 w-4 rounded border-raised bg-base text-claude focus:ring-claude"
                    />
                    <span
                      className={`flex-1 font-body text-sm ${
                        task.done ? "text-text-muted line-through" : "text-text-primary"
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTasks((current) => current.filter((item) => item.id !== task.id))
                      }
                      className="text-text-muted transition-colors hover:text-ember"
                      aria-label={`Remove ${task.text}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </label>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-raised px-4 py-8 text-center">
                  <Sparkles size={18} className="mx-auto mb-2 text-claude" />
                  <p className="font-body text-sm text-text-secondary">
                    Add a few goals to build today’s checklist.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <label className="mb-2 block font-display text-xs font-semibold tracking-wide text-text-muted">
              SNAPSHOT DATE
            </label>
            <input
              type="date"
              value={snapshotDate}
              onChange={(event) => setSnapshotDate(event.target.value)}
              onBlur={() => {
                hasEditedRef.current = true;
              }}
              className="w-full rounded-xl border border-raised bg-surface px-4 py-3 font-mono text-sm text-text-primary focus:outline-none"
            />
            <p className="mt-3 font-mono text-[11px] text-text-muted">
              Saves to `Goals/YYYY-MM-DD.md` in your Obsidian vault.
            </p>
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <h3 className="mb-2 font-display text-sm font-semibold text-text-primary">
              Vault preview
            </h3>
            <div className="space-y-2 rounded-xl border border-raised bg-surface px-4 py-3 font-mono text-[11px] text-text-secondary">
              <p>/opt/mission-control/Agentic OS Vault/Goals/{snapshotDate}.md</p>
              <p className="text-text-muted">
                The file is appended locally on the VPS every time you save.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <button
              onClick={saveSnapshot}
              disabled={isSaving}
              className="w-full rounded-xl bg-claude px-4 py-3 font-display text-sm font-semibold text-base transition-colors hover:bg-claude/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving to vault..." : "Save goals to vault"}
            </button>
            {lastSavedFile ? (
              <p className="mt-3 break-all font-mono text-[11px] text-text-muted">
                Saved to {lastSavedFile}
              </p>
            ) : (
              <p className="mt-3 font-mono text-[11px] text-text-muted">
                Your checklist is local until you save it.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

"use client";

import { motion } from "framer-motion";
import { BookText, CalendarDays, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SpeechMicButton } from "./SpeechMicButton";
import { saveAgenticOsEntry } from "@/lib/agentic-os-client";
import { getLocalDateInputValue, makeTimestampFromDateInput } from "@/lib/agentic-os-shared";

export function JournalEditor() {
  const [entryDate, setEntryDate] = useState(getLocalDateInputValue());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedFile, setLastSavedFile] = useState<string | null>(null);
  const lastSavedSignatureRef = useRef("");
  const saveTimerRef = useRef<number | null>(null);
  const hasEditedRef = useRef(false);

  const appendTranscript = (transcript: string) => {
    setBody((current) => {
      const base = current.trimEnd();
      return base ? `${base} ${transcript}` : transcript;
    });
  };

  const buildSnapshot = () => {
    const trimmedBody = body.trim();
    const signature = JSON.stringify({
      entryDate,
      title: title.trim(),
      body: trimmedBody,
    });

    return {
      body: trimmedBody,
      signature,
    };
  };

  const saveJournal = async () => {
    const { body: trimmedBody, signature } = buildSnapshot();
    if (!trimmedBody) return;

    setIsSaving(true);
    try {
      const result = await saveAgenticOsEntry({
        kind: "journal",
        source: "journal-page",
        title: title.trim() || `Journal · ${entryDate}`,
        timestamp: makeTimestampFromDateInput(entryDate),
        body: trimmedBody,
      }, { mode: "replace" });
      setLastSavedFile(result.filePath);
      lastSavedSignatureRef.current = signature;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!hasEditedRef.current) return;

    const { body: trimmedBody, signature } = buildSnapshot();
    if (!trimmedBody || signature === lastSavedSignatureRef.current) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void saveJournal();
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryDate, title, body]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-raised bg-surface"
    >
      <div className="flex items-center justify-between border-b border-raised px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-hermes-dim">
            <BookText size={18} color="var(--hermes)" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Journal
            </h2>
            <p className="font-mono text-xs text-text-muted">
              One markdown note per day in your Obsidian vault
            </p>
          </div>
        </div>
        <span className="rounded-full border border-raised px-3 py-1 font-mono text-[11px] text-text-muted">
          Daily note
        </span>
      </div>

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <label className="mb-2 block font-display text-xs font-semibold tracking-wide text-text-muted">
              ENTRY DATE
            </label>
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="text-text-muted" />
              <input
                type="date"
                value={entryDate}
                onChange={(event) => {
                  hasEditedRef.current = true;
                  setEntryDate(event.target.value);
                }}
                className="w-full rounded-xl border border-raised bg-surface px-4 py-3 font-mono text-sm text-text-primary focus:outline-none"
              />
            </div>
            <p className="mt-3 font-mono text-[11px] text-text-muted">
              Saves to `Journal/YYYY-MM-DD.md`.
            </p>
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <label className="mb-2 block font-display text-xs font-semibold tracking-wide text-text-muted">
              NOTE TITLE
            </label>
              <input
              type="text"
              value={title}
              onChange={(event) => {
                hasEditedRef.current = true;
                setTitle(event.target.value);
              }}
              placeholder="What should this note be called?"
              className="w-full rounded-xl border border-raised bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <p className="mt-3 font-mono text-[11px] text-text-muted">
              Optional. If blank, the save uses the journal date.
            </p>
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <h3 className="mb-2 font-display text-sm font-semibold text-text-primary">
              Vault preview
            </h3>
            <div className="rounded-xl border border-raised bg-surface px-4 py-3 font-mono text-[11px] text-text-secondary">
              /opt/mission-control/Agentic OS Vault/Journal/{entryDate}.md
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block font-display text-xs font-semibold tracking-wide text-text-muted">
                JOURNAL ENTRY
              </label>
              <SpeechMicButton
                onTranscript={appendTranscript}
                title="Dictate journal entry"
                ariaLabel="Dictate journal entry"
                className="h-9 w-9 rounded-lg border border-raised bg-base/40 text-text-muted hover:bg-raised-2 hover:text-text-primary"
                activeClassName="border-hermes/40 bg-hermes-dim text-hermes"
              />
            </div>
            <textarea
              value={body}
              onChange={(event) => {
                hasEditedRef.current = true;
                setBody(event.target.value);
              }}
              placeholder="Write a daily note, meeting summary, reflection, or next action…"
              rows={14}
              className="min-h-[320px] w-full resize-none rounded-xl border border-raised bg-surface px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <p className="mt-3 font-mono text-[11px] text-text-muted">
              Voice input appends straight into the note body.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={saveJournal}
              disabled={isSaving || !body.trim()}
              className="flex-1 rounded-xl bg-hermes px-4 py-3 font-display text-sm font-semibold text-base transition-colors hover:bg-hermes/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving to vault..." : "Save journal entry"}
            </button>
            {lastSavedFile && (
              <div className="flex-1 rounded-xl border border-raised bg-base/40 px-4 py-3">
                <p className="font-mono text-[11px] text-text-muted">Last saved file</p>
                <p className="break-all font-mono text-[11px] text-text-secondary">
                  {lastSavedFile}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-raised bg-base/40 p-4">
            <Sparkles size={16} className="mb-2 text-hermes" />
            <p className="font-body text-sm text-text-secondary">
              Each save appends to the same daily note so Obsidian can track your
              history in one place.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

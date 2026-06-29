import { NextRequest, NextResponse } from "next/server";
import {
  appendAgenticOsEntry,
  type AgenticOsEntry,
  type AgenticOsSaveMode,
  writeAgenticOsDailyNote,
} from "@/lib/agentic-os";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<AgenticOsEntry> & {
    mode?: AgenticOsSaveMode;
  };

  if (!payload.kind || !payload.body || !payload.source) {
    return NextResponse.json(
      { ok: false, error: "kind, source, and body are required" },
      { status: 400 }
    );
  }

  const entry = {
    kind: payload.kind,
    body: payload.body,
    source: payload.source,
    title: payload.title,
    threadId: payload.threadId,
    timestamp: payload.timestamp,
  };

  const result =
    payload.mode === "replace"
      ? await writeAgenticOsDailyNote(entry)
      : await appendAgenticOsEntry(entry);

  return NextResponse.json({ ok: true, ...result });
}

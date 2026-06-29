import type { AgenticOsEntry } from "@/lib/agentic-os";

export async function saveAgenticOsEntry(
  entry: AgenticOsEntry,
  options?: { mode?: "append" | "replace" }
) {
  const response = await fetch("/api/agentic-os", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...entry, mode: options?.mode ?? "append" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save Agentic OS entry (${response.status})`);
  }

  return (await response.json()) as {
    ok: true;
    filePath: string;
    entry: AgenticOsEntry & { timestamp: string };
  };
}

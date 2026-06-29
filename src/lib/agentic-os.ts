import { promises as fs } from "node:fs";
import path from "node:path";

export type AgenticOsEntryKind = "chat" | "goal" | "journal";

export type AgenticOsEntry = {
  kind: AgenticOsEntryKind;
  body: string;
  source: string;
  title?: string;
  threadId?: string;
  timestamp?: string;
};

export type AgenticOsWriteResult = {
  filePath: string;
  entry: AgenticOsEntry & { timestamp: string };
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getAgenticOsDir() {
  return process.env.AGENTIC_OS_DIR ?? path.join(process.cwd(), "Agentic OS");
}

export function getAgenticOsDailyFilePath(timestamp = new Date()) {
  const date = [
    timestamp.getFullYear(),
    pad(timestamp.getMonth() + 1),
    pad(timestamp.getDate()),
  ].join("-");

  return path.join(getAgenticOsDir(), `${date}.md`);
}

export function formatAgenticOsEntry(entry: AgenticOsEntry & { timestamp: string }) {
  const time = entry.timestamp.slice(11, 19);
  const title = entry.title?.trim() || `${entry.kind.toUpperCase()} • ${entry.source}`;
  const meta: string[] = [`kind: ${entry.kind}`, `source: ${entry.source}`];

  if (entry.threadId) {
    meta.push(`threadId: ${entry.threadId}`);
  }

  return [
    `## ${time} - ${title}`,
    "",
    `- timestamp: ${entry.timestamp}`,
    ...meta.map((item) => `- ${item}`),
    "",
    entry.body.trim(),
    "",
  ].join("\n");
}

export async function appendAgenticOsEntry(entry: AgenticOsEntry): Promise<AgenticOsWriteResult> {
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const filePath = getAgenticOsDailyFilePath(new Date(timestamp));
  const directory = path.dirname(filePath);

  await fs.mkdir(directory, { recursive: true });

  const hasFile = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

  if (!hasFile) {
    const header = [
      "---",
      `date: ${timestamp.slice(0, 10)}`,
      `source: mission-control`,
      "---",
      "",
    ].join("\n");
    await fs.writeFile(filePath, header, "utf8");
  }

  const rendered = formatAgenticOsEntry({ ...entry, timestamp });
  await fs.appendFile(filePath, `${rendered}\n`, "utf8");

  return {
    filePath,
    entry: { ...entry, timestamp },
  };
}


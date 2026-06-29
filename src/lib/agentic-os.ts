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

export type AgenticOsSaveMode = "append" | "replace";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

const AGENTIC_OS_FOLDER_BY_KIND: Record<AgenticOsEntryKind, string> = {
  chat: "Daily",
  goal: "Goals",
  journal: "Journal",
};

export function getObsidianVaultDir() {
  return (
    process.env.OBSIDIAN_VAULT_DIR ??
    process.env.AGENTIC_OS_VAULT_DIR ??
    process.env.AGENTIC_OS_DIR ??
    path.join(process.cwd(), "Agentic OS Vault")
  );
}

export function getAgenticOsDir() {
  return getAgenticOsKindDir("chat");
}

export function getAgenticOsKindDir(kind: AgenticOsEntryKind) {
  return path.join(getObsidianVaultDir(), AGENTIC_OS_FOLDER_BY_KIND[kind]);
}

export function getAgenticOsFilePath(kind: AgenticOsEntryKind, timestamp = new Date()) {
  const date = [
    timestamp.getFullYear(),
    pad(timestamp.getMonth() + 1),
    pad(timestamp.getDate()),
  ].join("-");

  return path.join(getAgenticOsKindDir(kind), `${date}.md`);
}

export function getAgenticOsDailyFilePath(timestamp = new Date()) {
  return getAgenticOsFilePath("chat", timestamp);
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

export function formatAgenticOsDailyNote(entry: AgenticOsEntry & { timestamp: string }) {
  const time = entry.timestamp.slice(11, 19);
  const title = entry.title?.trim() || `${entry.kind.toUpperCase()} • ${entry.source}`;
  const lines = [
    "---",
    `date: ${entry.timestamp.slice(0, 10)}`,
    `vault: ${path.basename(getObsidianVaultDir())}`,
    `folder: ${AGENTIC_OS_FOLDER_BY_KIND[entry.kind]}`,
    `source: ${entry.source}`,
    `kind: ${entry.kind}`,
    `title: ${title}`,
  ];

  if (entry.threadId) {
    lines.push(`threadId: ${entry.threadId}`);
  }

  lines.push("---", "", `# ${title}`, "", `- timestamp: ${entry.timestamp}`, `- time: ${time}`, "", entry.body.trim(), "");

  return lines.join("\n");
}

export async function appendAgenticOsEntry(entry: AgenticOsEntry): Promise<AgenticOsWriteResult> {
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const filePath = getAgenticOsFilePath(entry.kind, new Date(timestamp));
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
      `vault: ${path.basename(getObsidianVaultDir())}`,
      `folder: ${AGENTIC_OS_FOLDER_BY_KIND[entry.kind]}`,
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

export async function writeAgenticOsDailyNote(entry: AgenticOsEntry): Promise<AgenticOsWriteResult> {
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const filePath = getAgenticOsFilePath(entry.kind, new Date(timestamp));
  const directory = path.dirname(filePath);

  await fs.mkdir(directory, { recursive: true });

  const rendered = formatAgenticOsDailyNote({ ...entry, timestamp });
  await fs.writeFile(filePath, rendered, "utf8");

  return {
    filePath,
    entry: { ...entry, timestamp },
  };
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { getObsidianVaultDir } from "@/lib/agentic-os";

export type HermesMemoryEntry = {
  at: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
};

export type HermesMemorySnapshot = {
  version: 1;
  updatedAt: string;
  rememberedFacts: string[];
  recentTopics: string[];
  recentMessages: HermesMemoryEntry[];
};

const MAX_REMEMBERED_FACTS = 20;
const MAX_RECENT_TOPICS = 12;
const MAX_RECENT_MESSAGES = 12;

function uniqueTrimmed(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    output.push(trimmed);
  }

  return output;
}

export function getHermesMemoryFilePath() {
  return path.join(getObsidianVaultDir(), "Hermes", "memory.json");
}

export function getHermesMemoryDirectory() {
  return path.dirname(getHermesMemoryFilePath());
}

export function createEmptyHermesMemory(): HermesMemorySnapshot {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    rememberedFacts: [],
    recentTopics: [],
    recentMessages: [],
  };
}

export async function loadHermesMemory(): Promise<HermesMemorySnapshot> {
  const filePath = getHermesMemoryFilePath();

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<HermesMemorySnapshot>;
    return {
      version: 1,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      rememberedFacts: Array.isArray(parsed.rememberedFacts) ? parsed.rememberedFacts : [],
      recentTopics: Array.isArray(parsed.recentTopics) ? parsed.recentTopics : [],
      recentMessages: Array.isArray(parsed.recentMessages) ? parsed.recentMessages : [],
    };
  } catch {
    return createEmptyHermesMemory();
  }
}

async function saveHermesMemory(memory: HermesMemorySnapshot) {
  const filePath = getHermesMemoryFilePath();
  const markdownPath = path.join(path.dirname(filePath), "memory.md");
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
  await fs.writeFile(markdownPath, `${formatHermesMemory(memory)}\n`, "utf8");
  return filePath;
}

function extractRememberedFacts(message: string) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const cues = [
    "remember this",
    "for future reference",
    "going forward",
    "always",
    "my path is",
    "the path is",
    "path is",
    "my email is",
    "email is",
    "i prefer",
    "i'm on",
    "i am on",
    "running ubuntu",
    "git author is",
    "use this directory",
    "lets use this directory",
    "let's use this directory",
  ];

  if (!cues.some((cue) => lower.includes(cue))) {
    return [];
  }

  const cleaned = trimmed
    .replace(/^(for future reference|for future referance|remember this|going forward|always|note that)\s*[:,\-]?\s*/i, "")
    .trim();

  return cleaned ? [cleaned] : [trimmed];
}

function extractRecentTopics(message: string, intent?: string) {
  const words = message
    .toLowerCase()
    .split(/[^a-z0-9/.-]+/g)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const topicSeeds = words.filter((word) =>
    [
      "hermes",
      "mission",
      "control",
      "vault",
      "journal",
      "goal",
      "goals",
      "summary",
      "memory",
      "route",
      "routing",
      "ubuntu",
      "vps",
      "nginx",
      "port",
      "github",
      "obsidian",
      "local",
      "agent",
    ].some((hint) => word.includes(hint))
  );

  const intentTopic = intent ? [intent] : [];
  return uniqueTrimmed([...intentTopic, ...topicSeeds]).slice(0, 4);
}

export async function updateHermesMemory(
  params: {
    message: string;
    reply: string;
    intent?: string;
    assistantNote?: string;
  }
): Promise<{ memory: HermesMemorySnapshot; filePath: string }> {
  const current = await loadHermesMemory();
  const now = new Date().toISOString();
  const rememberedFacts = uniqueTrimmed([
    ...extractRememberedFacts(params.message),
    ...current.rememberedFacts,
  ]).slice(0, MAX_REMEMBERED_FACTS);

  const recentTopics = uniqueTrimmed([
    ...extractRecentTopics(params.message, params.intent),
    ...current.recentTopics,
  ]).slice(0, MAX_RECENT_TOPICS);

  const recentMessages = [
    ...current.recentMessages,
    {
      at: now,
      role: "user" as const,
      content: params.message.trim(),
      intent: params.intent,
    },
    {
      at: now,
      role: "assistant" as const,
      content: params.assistantNote ?? params.reply,
      intent: params.intent,
    },
  ].slice(-MAX_RECENT_MESSAGES);

  const memory: HermesMemorySnapshot = {
    version: 1,
    updatedAt: now,
    rememberedFacts,
    recentTopics,
    recentMessages,
  };

  const filePath = await saveHermesMemory(memory);
  return { memory, filePath };
}

export function formatHermesMemory(memory: HermesMemorySnapshot) {
  const updated = memory.updatedAt.slice(0, 19).replace("T", " ");
  const lines = [
    "---",
    "agent: Hermes",
    `updatedAt: ${memory.updatedAt}`,
    `rememberedFacts: ${memory.rememberedFacts.length}`,
    `recentTopics: ${memory.recentTopics.length}`,
    `recentMessages: ${memory.recentMessages.length}`,
    "---",
    "",
    `# Hermes Memory`,
    "",
    `Last updated: ${updated}`,
    "",
    "## Remembered facts",
    ...(memory.rememberedFacts.length
      ? memory.rememberedFacts.map((fact) => `- ${fact}`)
      : ["- No remembered facts yet."]),
    "",
    "## Recent topics",
    ...(memory.recentTopics.length
      ? memory.recentTopics.map((topic) => `- ${topic}`)
      : ["- No recent topics yet."]),
    "",
    "## Recent messages",
    ...(memory.recentMessages.length
      ? memory.recentMessages.map((entry) => `- [${entry.role}] ${entry.content}`)
      : ["- No recent messages yet."]),
    "",
  ];

  return lines.join("\n");
}

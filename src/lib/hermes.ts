import { appendAgenticOsEntry } from "@/lib/agentic-os";
import { loadHermesMemory, updateHermesMemory } from "@/lib/hermes-memory";
import type { HermesMemorySnapshot } from "@/lib/hermes-memory";

export type HermesRole = "user" | "assistant";

export type HermesMessage = {
  role: HermesRole;
  content: string;
};

export type HermesIntent = "chat" | "summary" | "goal" | "journal" | "memory";

export type HermesSavedArtifact = {
  kind: "chat" | "goal" | "journal";
  filePath: string;
};

export type HermesDecision = {
  intent: HermesIntent;
  reply: string;
  highlights: string[];
  savedArtifacts: HermesSavedArtifact[];
  memory: HermesMemorySnapshot;
  memoryFilePath: string;
  provider: "openai" | "local-fallback";
  model: string;
};

const GOAL_HINTS = [
  "goal",
  "goals",
  "task",
  "tasks",
  "todo",
  "to-do",
  "checklist",
  "action item",
  "action items",
  "turn into goals",
];

const JOURNAL_HINTS = [
  "journal",
  "note",
  "notes",
  "diary",
  "reflection",
  "reflect",
  "log",
  "write up",
  "draft a journal",
];

const SUMMARY_HINTS = ["summarize", "summary", "recap", "brief", "tl;dr", "tldr"];
const MEMORY_HINTS = [
  "what do you remember",
  "what do you know about me",
  "remember about me",
  "recall",
  "memory",
  "what have you stored",
  "show memory",
  "what do you know",
];

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function normalizeLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}

function splitIntoCandidateLines(text: string) {
  return text
    .split(/\r?\n|;|•/g)
    .map(normalizeLine)
    .filter(Boolean);
}

function extractTasks(text: string) {
  const lines = splitIntoCandidateLines(text);
  if (lines.length > 0) {
    return lines;
  }

  const fallback = text.trim();
  return fallback ? [fallback] : [];
}

function extractUserMessages(conversation: HermesMessage[]) {
  return conversation
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function shortenSentence(text: string) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return sentence.replace(/\s+/g, " ").trim();
}

function buildSummary(messages: string[]) {
  const unique = Array.from(new Set(messages.map(shortenSentence).filter(Boolean)));
  const selected = unique.slice(0, 4);

  if (!selected.length) {
    return [
      "I do not have enough context yet.",
      "Paste a few notes, or ask me to summarize the conversation above.",
    ].join(" ");
  }

  return [
    "Here is the summary I assembled:",
    ...selected.map((item) => `- ${item}`),
  ].join("\n");
}

function buildGoalsBody(message: string) {
  const tasks = extractTasks(message);
  return tasks.map((task) => `- [ ] ${task}`).join("\n");
}

function buildJournalBody(message: string) {
  return message.trim();
}

function buildChatReply(intent: HermesIntent, message: string, highlights: string[]) {
  if (intent === "goal") {
    const count = highlights.length || extractTasks(message).length;
    return [
      `Hermes captured ${count} goal${count === 1 ? "" : "s"} and saved them locally.`,
      "You can review the checklist in the Goals vault folder.",
    ].join(" ");
  }

  if (intent === "journal") {
    return [
      "Hermes saved a journal draft to your vault.",
      "You can keep talking or open the Journal page to refine it.",
    ].join(" ");
  }

  if (intent === "summary") {
    return buildSummary(highlights);
  }

  if (intent === "memory") {
    return [
      "I can remember local facts and recent topics from this VPS session.",
      "Ask me to show memory, and I’ll summarize what is stored locally.",
    ].join(" ");
  }

  return [
    "Hermes saved this as a local capture.",
    "Ask me to turn it into goals, a journal entry, or a summary.",
  ].join(" ");
}

function buildHermesInstructions(intent: HermesIntent) {
  const base = [
    "You are Hermes, the local routing agent inside Mission Control OS.",
    "Use a concise, practical, teammate-like tone.",
    "Do not mention policies or that you are an AI model.",
    "Answer naturally and directly.",
  ];

  if (intent === "summary") {
    base.push("Summarize the conversation clearly, using short bullets if helpful.");
  } else if (intent === "goal") {
    base.push("Help the user turn their message into actionable goals or checklist items.");
  } else if (intent === "journal") {
    base.push("Help the user shape a clean journal entry or daily note.");
  } else if (intent === "memory") {
    base.push("Answer from the supplied memory context and say only what is present there.");
  } else {
    base.push("Respond helpfully to the user's request and keep the answer brief.");
  }

  return base.join("\n");
}

function buildHermesInput(params: {
  intent: HermesIntent;
  message: string;
  conversation: HermesMessage[];
  memory: HermesMemorySnapshot;
}) {
  const recentConversation = params.conversation.slice(-8);
  const conversationLines = recentConversation.length
    ? recentConversation.map((entry) => `${entry.role}: ${entry.content}`).join("\n")
    : "No prior conversation.";

  return [
    `Intent: ${params.intent}`,
    "",
    "Local memory:",
    params.memory.rememberedFacts.length
      ? `Remembered facts:\n${params.memory.rememberedFacts.map((fact) => `- ${fact}`).join("\n")}`
      : "Remembered facts:\n- None yet.",
    params.memory.recentTopics.length
      ? `Recent topics:\n${params.memory.recentTopics.map((topic) => `- ${topic}`).join("\n")}`
      : "Recent topics:\n- None yet.",
    "",
    "Recent conversation:",
    conversationLines,
    "",
    "Current user message:",
    params.message,
  ].join("\n");
}

function extractOutputText(response: unknown) {
  if (!response || typeof response !== "object") {
    return "";
  }

  const payload = response as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string; output_text?: string }>;
    }>;
  };

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts: string[] = [];
  for (const item of payload.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type !== "output_text") continue;
      if (typeof content.text === "string" && content.text.trim()) {
        parts.push(content.text.trim());
      } else if (typeof content.output_text === "string" && content.output_text.trim()) {
        parts.push(content.output_text.trim());
      }
    }
  }

  return parts.join("\n").trim();
}

async function callOpenAIResponsesApi(params: {
  intent: HermesIntent;
  message: string;
  conversation: HermesMessage[];
  memory: HermesMemorySnapshot;
}) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      instructions: buildHermesInstructions(params.intent),
      input: buildHermesInput(params),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      payload?.message ??
      `OpenAI request failed (${response.status})`;
    throw new Error(message);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI response did not contain any text output");
  }

  return outputText;
}

export async function processHermesMessage(
  message: string,
  conversation: HermesMessage[] = []
): Promise<HermesDecision> {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const userMessages = extractUserMessages(conversation);
  const previousMessages = userMessages.slice(0, -1);
  const currentMemory = await loadHermesMemory();

  let intent: HermesIntent = "chat";
  if (includesAny(lower, MEMORY_HINTS)) {
    intent = "memory";
  } else if (includesAny(lower, SUMMARY_HINTS)) {
    intent = "summary";
  } else if (includesAny(lower, GOAL_HINTS)) {
    intent = "goal";
  } else if (includesAny(lower, JOURNAL_HINTS)) {
    intent = "journal";
  }

  const savedArtifacts: HermesSavedArtifact[] = [];

  const chatEntry = await appendAgenticOsEntry({
    kind: "chat",
    source: "hermes",
    title: "Hermes chat",
    threadId: "hermes",
    body: trimmed,
  });
  savedArtifacts.push({ kind: "chat", filePath: chatEntry.filePath });

  let reply = "";
  const highlights: string[] = [];
  let provider: HermesDecision["provider"] = "openai";
  let model = DEFAULT_OPENAI_MODEL;

  if (intent === "goal") {
    const goalBody = buildGoalsBody(trimmed);
    const goalEntry = await appendAgenticOsEntry({
      kind: "goal",
      source: "hermes",
      title: "Hermes goals",
      threadId: "hermes",
      body: goalBody,
    });
    savedArtifacts.push({ kind: "goal", filePath: goalEntry.filePath });
    highlights.push(...extractTasks(trimmed));
    reply = buildChatReply("goal", trimmed, highlights);
  } else if (intent === "journal") {
    const journalBody = buildJournalBody(trimmed);
    const journalEntry = await appendAgenticOsEntry({
      kind: "journal",
      source: "hermes",
      title: "Hermes journal draft",
      threadId: "hermes",
      body: journalBody,
    });
    savedArtifacts.push({ kind: "journal", filePath: journalEntry.filePath });
    highlights.push(shortenSentence(journalBody));
    reply = buildChatReply("journal", trimmed, highlights);
  } else if (intent === "summary") {
    const sourceMessages = previousMessages.length ? previousMessages : [trimmed];
    highlights.push(...sourceMessages.map(shortenSentence));
  } else if (intent === "memory") {
    highlights.push(...currentMemory.rememberedFacts.slice(0, 3));
  } else {
    highlights.push(shortenSentence(trimmed));
  }

  try {
    reply = await callOpenAIResponsesApi({
      intent,
      message: trimmed,
      conversation,
      memory: currentMemory,
    });
  } catch (error) {
    provider = "local-fallback";
    reply = buildChatReply(intent, trimmed, highlights);
    if (error instanceof Error) {
      reply = `${reply}\n\n(OpenAI fallback: ${error.message})`;
    } else {
      reply = `${reply}\n\n(OpenAI fallback: Hermes could not reach the API.)`;
    }
  }

  const memoryResult = await updateHermesMemory({
    message: trimmed,
    reply,
    intent,
    assistantNote:
      intent === "memory"
        ? "Hermes answered using local memory."
        : intent === "summary"
          ? "Hermes built a summary from recent local conversation."
          : intent === "goal"
            ? "Hermes routed the message into the goals folder."
            : intent === "journal"
              ? "Hermes routed the message into the journal folder."
              : "Hermes saved a local capture.",
  });

  return {
    intent,
    reply,
    highlights,
    savedArtifacts,
    memory: memoryResult.memory,
    memoryFilePath: memoryResult.filePath,
    provider,
    model,
  };
}

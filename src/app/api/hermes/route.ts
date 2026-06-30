import { NextRequest, NextResponse } from "next/server";
import { type HermesMessage, processHermesMessage } from "@/lib/hermes";
import { getHermesMemoryFilePath } from "@/lib/hermes-memory";

export const runtime = "nodejs";

export async function GET() {
  const preferredProvider = process.env.HERMES_PROVIDER?.trim().toLowerCase();
  const hasDeepSeekKey = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const provider =
    preferredProvider === "openai"
      ? "openai"
      : preferredProvider === "deepseek"
        ? "deepseek"
        : hasDeepSeekKey
          ? "deepseek"
          : hasOpenAiKey
            ? "openai"
            : "local-fallback";

  return NextResponse.json({
    ok: true,
    status: provider === "local-fallback" ? "offline" : "online",
    provider,
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as {
      message?: string;
      conversation?: HermesMessage[];
    };

    const message = payload.message?.trim();
    if (!message) {
      return NextResponse.json(
        { ok: false, error: "message is required" },
        { status: 400 }
      );
    }

    const result = await processHermesMessage(message, payload.conversation ?? []);

    return NextResponse.json({
      ok: true,
      ...result,
      memoryFilePath: getHermesMemoryFilePath(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Hermes request failed",
      },
      { status: 500 }
    );
  }
}

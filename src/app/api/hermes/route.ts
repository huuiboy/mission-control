import { NextRequest, NextResponse } from "next/server";
import { type HermesMessage, processHermesMessage } from "@/lib/hermes";
import { getHermesMemoryFilePath } from "@/lib/hermes-memory";

export const runtime = "nodejs";

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

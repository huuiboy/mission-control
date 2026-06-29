import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, makeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password, action } = await req.json();

  // ── Logout ────────────────────────────────
  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }

  // ── Login ─────────────────────────────────
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) {
    // No password configured → auth disabled, let them through
    const res = NextResponse.json({ ok: true });
    const token = await makeToken("__no_password__");
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const token = await makeToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

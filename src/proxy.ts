import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, makeToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: login page, auth API, static assets, Next internals
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // If no AUTH_PASSWORD is set, auth is disabled - allow everything
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) {
    return NextResponse.next();
  }

  // Check session cookie
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const validToken = await makeToken(expected);

  if (cookie === validToken) {
    return NextResponse.next();
  }

  // Not authenticated -> redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

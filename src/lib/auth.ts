/**
 * Shared auth helpers.
 * Uses Web Crypto API so it works in both Node and Edge (middleware) runtimes.
 */

const COOKIE_NAME = "mc_session";

async function makeToken(password: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "mission-control-default-secret";
  const data = new TextEncoder().encode(password + ":" + secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export { COOKIE_NAME, makeToken };

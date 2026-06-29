# Mission Control

A dashboard UI for managing Claude and (eventually) other AI agents from one
place. Dark, telemetry-styled, built with Next.js + Tailwind + Framer Motion.

## What this is right now

This is now wired for local markdown capture on the VPS. Specifically:

- The **Claude panel** is fully designed (status, live signal waveform, quick
  actions, recent sessions, command input) and its messages can be captured to
  local markdown on the server.
- **OpenClaw** and **Hermes** are placeholder sections with a "Connect" button
  that doesn't do anything yet — these were named as future agents, not
  services that exist today.
- The activity log can write to an Obsidian vault on the VPS as daily notes.

Nothing here sends data to Honcho by default. The save path is local to the
machine running the Next.js server.

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Obsidian vault setup

For a dedicated vault on the VPS, point the app at a vault root like:

```bash
/opt/mission-control/Agentic OS Vault
```

The app writes daily notes into:

```text
/opt/mission-control/Agentic OS Vault/Daily/YYYY-MM-DD.md
```

Recommended environment variable:

```bash
OBSIDIAN_VAULT_DIR=/opt/mission-control/Agentic OS Vault
```

If you open that folder in Obsidian, the daily markdown files will appear as a
normal vault.

Suggested vault layout:

```text
/opt/mission-control/Agentic OS Vault/
  Daily/
  Goals/
  Journal/
```

Startup checklist:

1. Create the vault root and subfolders.
2. Set `OBSIDIAN_VAULT_DIR=/opt/mission-control/Agentic OS Vault` on the VPS.
3. Restart the `mission-control` service.
4. Open the vault root in Obsidian.
5. Send a chat or goal to confirm the note is written where you expect it.

If you want the app to keep using the same folder after reboot, define the env
var in the service file or your process manager instead of only in a shell.

## Wiring up the real Claude Code CLI bridge

The plan discussed for this project: a Next.js **API route** that shells out
to the `claude` CLI on the machine running the Next.js server, using Node's
`child_process`. Rough shape:

```ts
// src/app/api/claude/run/route.ts
import { spawn } from "node:child_process";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  return new Promise((resolve) => {
    const child = spawn("claude", ["-p", prompt]);
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.on("close", () => {
      resolve(Response.json({ output }));
    });
  });
}
```

Important constraints to know before building this out:

- This requires a **persistent Node server with shell access** — it will
  **not** run on static hosts or most serverless platforms (e.g. plain shared
  hosting, Vercel/Netlify serverless functions, edge runtimes). You'll need a
  VPS, a long-running container, or a self-hosted Node process.
- The `claude` CLI needs to be installed and authenticated on whatever
  machine actually runs this server — not in your browser, not in any
  sandboxed build step.
- Shelling out to a CLI from a web-facing route is a real attack surface if
  this is ever exposed beyond `localhost`. At minimum: validate/sanitize
  input before it reaches `spawn`, never use `exec`/string concatenation
  (use `spawn` with an args array, as above, to avoid shell injection), and
  put auth in front of the route before deploying it anywhere reachable from
  the internet.

## Connecting OpenClaw / Hermes (or any other agent)

The `AgentPanel` component (`src/components/AgentPanel.tsx`) is generic —
each agent just needs a name, accent color, icon, and (eventually) an API
route to call. Once those services have real APIs, swap the "Not connected
yet" state for live status, following the same pattern as the Claude panel.

## Project structure

```
src/
  app/
    page.tsx          – assembles the dashboard
    layout.tsx         – fonts, metadata
    globals.css         – design tokens (colors, type, motion)
  components/
    StatusBar.tsx       – top bar: clock, system status
    ClaudePanel.tsx      – primary agent panel
    AgentPanel.tsx       – reusable placeholder panel (OpenClaw, Hermes)
    SignalWave.tsx        – animated signal waveform (signature element)
    LogFeed.tsx            – activity log strip
```

## Notes on fonts

The design uses Space Grotesk (display), Inter (body), and JetBrains Mono
(data/telemetry), loaded via the Google Fonts CDN in `layout.tsx`. If you're
deploying somewhere without outbound internet access at runtime, swap that
for self-hosted font files via `next/font/local`.

## VPS reverse proxy

If you want to expose the app at `tryl.apexledger.pro`, see
[nginx-reverse-proxy.md](./docs/nginx-reverse-proxy.md).

## VPS deployment

For the full four-step VPS runbook, see
[vps-deploy.md](./docs/vps-deploy.md).

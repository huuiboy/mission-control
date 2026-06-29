# Agentic OS + Obsidian Vault Architecture

## What the vault is for

The vault is the local memory layer behind the app:
- it keeps daily Markdown files on the VPS
- Obsidian can open the folder directly as a vault
- the app can append to it without needing any third-party sync

## Proposed flow

1. The UI emits a chat, goal, or journal entry.
2. The Next.js server appends that entry to a daily Markdown file.
3. The same server payload is written into a dedicated Obsidian vault.
4. Obsidian can index the files, backlinks, and search them normally.
5. The app can read the same structure later if you want richer retrieval.

## File layout

Suggested vault path on the VPS:
- `/opt/mission-control/Agentic OS Vault`

Suggested daily note path:
- `/opt/mission-control/Agentic OS Vault/Daily/2026-06-29.md`

Suggested file format:
- one heading per entry
- timestamp, kind, and source at the top
- body text underneath

## Why this is a good fit for `mission-control`

- the app already has chat surfaces
- the same ingestion point can handle chats, goals, and journal entries
- daily Markdown is easy to inspect, back up, and browse in Obsidian
- the structure stays simple enough to sync somewhere else later if needed

## What to add next

- a goal entry form
- a journal entry form
- a retrieval path that reads back from the vault before answering

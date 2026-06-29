# Honcho + Agentic OS POC

Goal: capture activity from `mission-control` into daily Markdown files and keep the path open for Honcho-backed memory later.

What this proves:
- chat messages can be captured automatically when sent
- goals and journal entries can use the same ingestion endpoint later
- the server can append to a single daily file per day

Recommended first pass:
- store files in `Agentic OS/YYYY-MM-DD.md`
- write the file path from `AGENTIC_OS_DIR`
- append entries in Markdown, not JSON, so the output is human-readable and easy to sync to Honcho or any other tool later

Minimal data model:
- `kind`: `chat`, `goal`, or `journal`
- `source`: where the entry came from
- `title`: short label
- `body`: the actual content
- `threadId`: optional conversation or object id
- `timestamp`: ISO string

Success criteria:
- sending a chat writes one Markdown entry
- multiple entries on the same day land in the same file
- the route works without any API keys


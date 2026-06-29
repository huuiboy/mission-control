import { promises as fs } from "node:fs";
import path from "node:path";
import { FileText, FolderOpen, Vault } from "lucide-react";
import { getObsidianVaultDir } from "@/lib/agentic-os";

export const dynamic = "force-dynamic";

type VaultFile = {
  name: string;
  fullPath: string;
  modifiedAt: string;
  size: number;
  preview: string;
};

const FOLDERS = [
  { key: "Daily", label: "Daily", description: "Chat notes and daily logs" },
  { key: "Goals", label: "Goals", description: "Checklist snapshots" },
  { key: "Journal", label: "Journal", description: "Daily reflections" },
] as const;

async function listVaultFiles(vaultDir: string, folder: string, limit = 5): Promise<VaultFile[]> {
  const dir = path.join(vaultDir, folder);

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, "utf8");
          return {
            name: entry.name,
            fullPath,
            modifiedAt: stats.mtime.toISOString(),
            size: stats.size,
            preview: content.split("\n").slice(0, 7).join("\n"),
          };
        })
    );

    return files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, limit);
  } catch {
    return [];
  }
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function VaultPage() {
  const vaultDir = getObsidianVaultDir();
  const folderData = await Promise.all(
    FOLDERS.map(async (folder) => ({
      ...folder,
      files: await listVaultFiles(vaultDir, folder.key),
    }))
  );

  const totalFiles = folderData.reduce((sum, folder) => sum + folder.files.length, 0);
  const latestFile = folderData
    .flatMap((folder) => folder.files.map((file) => ({ ...file, folder: folder.label })))
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))[0];

  return (
    <div className="bg-grid relative min-h-screen flex-1 overflow-auto">
      <header className="border-b border-raised bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">
              Vault
            </h1>
            <p className="mt-1 font-body text-sm text-text-secondary">
              Browse the Obsidian vault on the VPS.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-claude/30 bg-claude-dim px-3 py-2 font-mono text-xs text-claude">
            <FolderOpen size={14} />
            {totalFiles} markdown files
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-raised bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-claude-dim">
                <Vault size={18} color="var(--claude)" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  {vaultDir}
                </h2>
                <p className="font-mono text-xs text-text-muted">
                  Obsidian vault root on the VPS
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-raised bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Latest file
            </h2>
            {latestFile ? (
              <div className="mt-3 space-y-2">
                <p className="font-mono text-xs text-text-muted">
                  {latestFile.folder} · {latestFile.name} · {formatSize(latestFile.size)}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {new Date(latestFile.modifiedAt).toLocaleString()}
                </p>
                <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xl border border-raised bg-base/40 p-3 font-mono text-[11px] text-text-secondary">
                  {latestFile.preview}
                </pre>
              </div>
            ) : (
              <p className="mt-3 font-body text-sm text-text-secondary">
                No markdown files found yet.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {folderData.map((folder) => (
            <article key={folder.key} className="rounded-2xl border border-raised bg-surface p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {folder.label}
                  </h3>
                  <p className="font-body text-sm text-text-secondary">
                    {folder.description}
                  </p>
                </div>
                <span className="rounded-full border border-raised px-3 py-1 font-mono text-[11px] text-text-muted">
                  {folder.files.length} files
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {folder.files.length ? (
                  folder.files.map((file) => (
                    <div key={file.fullPath} className="rounded-xl border border-raised bg-base/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs text-text-primary">{file.name}</p>
                          <p className="font-mono text-[11px] text-text-muted">
                            {new Date(file.modifiedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] text-text-muted">
                          {formatSize(file.size)}
                        </span>
                      </div>
                      <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-text-secondary">
                        {file.preview}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-raised px-4 py-8 text-center">
                    <FileText size={18} className="mx-auto mb-2 text-text-muted" />
                    <p className="font-body text-sm text-text-secondary">
                      No files yet in this folder.
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

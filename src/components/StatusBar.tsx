"use client";

import { motion } from "framer-motion";
import { LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StatusBar() {
  const [now, setNow] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
  };

  const time = now
    ? now.toLocaleTimeString("en-US", { hour12: false })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-raised bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="relative flex h-2.5 w-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-claude opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-claude" />
          </motion.span>
          <span className="font-display text-sm font-medium tracking-wide text-text-primary">
            MISSION CONTROL
          </span>
          <span className="hidden font-mono text-xs text-text-muted sm:inline">
            / all systems nominal
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden flex-col items-end font-mono text-xs leading-tight sm:flex">
            <span className="text-text-primary">{time}</span>
            <span className="text-text-muted">{date}</span>
          </div>
          <button
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-raised text-text-secondary transition-colors hover:border-claude/40 hover:text-claude"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-raised text-text-secondary transition-colors hover:border-ember/40 hover:text-ember"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

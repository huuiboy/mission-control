"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignalWave } from "@/components/SignalWave";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Auto-clear error when typing
  useEffect(() => {
    if (error && password) setError("");
  }, [password, error]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (loading || !password.trim()) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password.trim() }),
        });
        const data = await res.json();

        if (data.ok) {
          setSuccess(true);
          setTimeout(() => router.push("/"), 800);
        } else {
          setError(data.error || "Access denied");
          setLoading(false);
        }
      } catch {
        setError("Connection failed");
        setLoading(false);
      }
    },
    [password, loading, router]
  );

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: success ? "var(--claude)" : "var(--raised)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-raised bg-surface"
          >
            {success ? (
              <ShieldCheck size={24} className="text-claude" />
            ) : (
              <Lock size={24} className="text-text-muted" />
            )}
          </motion.div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            Mission Control
          </h1>
          <p className="mt-2 font-mono text-xs text-text-muted">
            authenticate to continue
          </p>
        </div>

        {/* Signal wave — breathes behind the card */}
        <div className="mb-6 opacity-40">
          <SignalWave
            state={loading ? "thinking" : success ? "active" : "idle"}
            color={success ? "var(--claude)" : "var(--text-muted)"}
            height={32}
          />
        </div>

        {/* Login card */}
        <motion.div
          layout
          className="overflow-hidden rounded-2xl border border-raised bg-surface"
        >
          <div className="p-6">
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                error
                  ? "border-ember/50 bg-ember-dim"
                  : success
                    ? "border-claude/50 bg-claude-dim"
                    : "border-raised bg-base/60 focus-within:border-claude/50"
              }`}
            >
              <Lock
                size={15}
                className={
                  error
                    ? "text-ember"
                    : success
                      ? "text-claude"
                      : "text-text-muted"
                }
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter access key"
                autoFocus
                disabled={success}
                className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={loading || !password.trim() || success}
                aria-label="Authenticate"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-claude-dim hover:text-claude disabled:opacity-30 disabled:hover:bg-transparent"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="block h-4 w-4 rounded-full border-2 border-text-muted border-t-transparent"
                  />
                ) : (
                  <ArrowRight size={15} />
                )}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-3 font-mono text-xs text-ember">
                    <AlertCircle size={12} />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-3 font-mono text-xs text-claude">
                    <ShieldCheck size={12} />
                    Access granted — entering mission control
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer hint */}
        <p className="mt-5 text-center font-mono text-[11px] text-text-muted/50">
          session persists for 7 days
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bell, PartyPopper, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "info" | "success" | "error" | "nudge" | "kudo";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastCtx = { push: (t: Omit<Toast, "id">) => void };
const Ctx = createContext<ToastCtx | null>(null);

const ICONS: Record<ToastTone, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
  nudge: Bell,
  kudo: PartyPopper,
};

const ACCENT: Record<ToastTone, string> = {
  info: "text-ink bg-surface-strong",
  success: "text-success bg-success/15",
  error: "text-error bg-error/12",
  nudge: "text-ink bg-tl-thinking/40",
  kudo: "text-ink bg-tl-done/35",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { id, tone: "info", duration: 4500, ...t };
      setToasts((prev) => [...prev.slice(-3), toast]);
      timers.current[id] = setTimeout(() => dismiss(id), toast.duration);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2.5 p-4 sm:items-end sm:p-6">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = ICONS[t.tone ?? "info"];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-hairline bg-surface-card p-3.5 shadow-lift"
              >
                <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-md", ACCENT[t.tone ?? "info"])}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-title-sm text-ink">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-body-sm text-body">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded p-1 text-muted transition-colors hover:text-ink"
                  aria-label="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

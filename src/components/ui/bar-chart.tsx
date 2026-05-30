"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

export type BarDatum = {
  label: string;
  seconds: number;
  isMe?: boolean;
};

/** Horizontal relative-time bars (member comparison on the dashboard). */
export function BarChart({ data, className }: { data: BarDatum[]; className?: string }) {
  const max = Math.max(1, ...data.map((d) => d.seconds));

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-body-sm text-muted">No coding time logged yet.</p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d, i) => {
        const pct = (d.seconds / max) * 100;
        return (
          <div key={d.label + i} className="flex items-center gap-3">
            <span
              className={cn(
                "w-24 shrink-0 truncate text-body-sm sm:w-28",
                d.isMe ? "font-semibold text-ink" : "text-body",
              )}
            >
              {d.label}
            </span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-canvas-soft">
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-md",
                  d.isMe ? "bg-primary" : "bg-tl-read",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, d.seconds > 0 ? 4 : 0)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.05 * i }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-caption font-medium text-ink/70 tabular">
                {formatDuration(d.seconds)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  tone = "primary",
}: {
  value: number; // 0..100
  className?: string;
  barClassName?: string;
  tone?: "primary" | "success";
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-pill bg-surface-strong", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn(
          "h-full rounded-pill",
          tone === "success" ? "bg-success" : "bg-primary",
          barClassName,
        )}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 24, delay: 0.1 }}
      />
    </div>
  );
}

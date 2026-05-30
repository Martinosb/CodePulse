"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="rounded-lg border border-hairline bg-surface-card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span
          className={cn(
            "grid size-8 place-items-center rounded-md",
            tone === "primary" ? "bg-primary/12 text-primary" : "bg-surface-strong text-ink",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-display-md tabular text-ink">
        <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
      </p>
      {hint && <p className="mt-1 text-caption text-muted">{hint}</p>}
    </motion.div>
  );
}

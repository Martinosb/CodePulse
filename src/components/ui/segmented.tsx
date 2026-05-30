"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId = "segmented",
  className,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill border border-hairline bg-canvas-soft p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "relative rounded-pill px-3.5 py-1.5 text-body-sm font-medium transition-colors",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-pill bg-surface-card shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-hairline"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

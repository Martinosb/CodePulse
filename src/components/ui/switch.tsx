"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        checked ? "border-primary bg-primary" : "border-hairline-strong bg-surface-strong",
        disabled && "opacity-50",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={cn(
          "inline-block size-[18px] rounded-full bg-surface-card shadow-sm",
          checked ? "ml-auto mr-0.5" : "ml-0.5",
        )}
      />
    </button>
  );
}

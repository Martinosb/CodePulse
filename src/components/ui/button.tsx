"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ink" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-active shadow-[0_1px_0_rgb(0_0_0/0.04)]",
  secondary:
    "bg-surface-card text-ink border border-hairline-strong hover:border-muted-soft hover:bg-canvas-soft",
  ink: "bg-ink text-canvas hover:opacity-90",
  ghost: "bg-transparent text-ink hover:bg-surface-strong/60",
  danger:
    "bg-surface-card text-error border border-error/30 hover:bg-error/10",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-md gap-1.5",
  md: "h-10 px-[18px] text-sm rounded-md gap-2",
  lg: "h-12 px-6 text-[15px] rounded-lg gap-2",
};

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.02, y: -1 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium tracking-tight transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:cursor-not-allowed disabled:opacity-55",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

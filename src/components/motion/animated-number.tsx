"use client";

import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";

/**
 * Ticks from 0 (or the previous value) up to `value` on mount/change.
 * Honors prefers-reduced-motion via framer-motion's internal handling.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1.1,
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) =>
    `${prefix}${latest.toFixed(decimals)}${suffix}`,
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span className={className}>{rounded}</motion.span>;
}

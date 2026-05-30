"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Target, Flame, Quote } from "lucide-react";
import { Logo } from "@/components/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            <h1 className="text-display-md text-ink">{heading}</h1>
            <p className="mt-2 text-body-sm text-body">{subheading}</p>
            <div className="mt-7">{children}</div>
          </motion.div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden border-l border-hairline bg-canvas-soft lg:block">
        <div className="absolute inset-0 bg-dotgrid opacity-50" />
        <div className="relative flex h-full flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md"
          >
            <Quote className="size-8 text-primary" />
            <p className="mt-5 text-display-sm leading-snug text-ink">
              “The group chat died, but the leaderboard never did. We shipped more in one month
              than the whole last semester.”
            </p>
            <p className="mt-4 text-body-sm text-muted">— A CS study cohort, probably</p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, label: "Live ranks" },
                { icon: Target, label: "Real goals" },
                { icon: Flame, label: "Daily streaks" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-hairline bg-surface-card p-4">
                  <s.icon className="size-5 text-ink" />
                  <p className="mt-2 text-caption text-body">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

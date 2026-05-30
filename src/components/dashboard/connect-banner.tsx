"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plug, ArrowRight } from "lucide-react";

export function ConnectBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/[0.06] p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
          <Plug className="size-4" />
        </span>
        <div>
          <p className="text-title-sm text-ink">Connect WakaTime to appear on the leaderboard</p>
          <p className="text-body-sm text-body">
            Your coding time won't show up until you connect your API key.
          </p>
        </div>
      </div>
      <Link
        href="/settings"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
      >
        Connect now <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}

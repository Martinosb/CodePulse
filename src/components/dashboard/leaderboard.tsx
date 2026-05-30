"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Bell, PartyPopper, Crown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export type LeaderRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  total_seconds: number | null;
  top_language: string | null;
  top_project: string | null;
  is_me: boolean;
};

export function Leaderboard({
  rows,
  onInteract,
}: {
  rows: LeaderRow[];
  onInteract: (recipientId: string, type: "nudge" | "kudo") => Promise<void> | void;
}) {
  return (
    <motion.ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {rows.map((row, i) => (
          <motion.li
            key={row.user_id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 sm:gap-4 sm:p-3.5",
              row.is_me
                ? "border-primary/35 bg-primary/[0.04]"
                : "border-hairline bg-surface-card",
            )}
          >
            <Rank index={i} />
            <Avatar name={row.display_name} src={row.avatar_url} seed={row.user_id} size={40} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-title-sm text-ink">
                  {row.display_name}
                </span>
                {row.is_me && <span className="text-caption text-primary">you</span>}
                {row.current_streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-caption text-muted" title={`${row.current_streak}-day streak`}>
                    <Flame className="size-3 text-primary" />
                    {row.current_streak}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {row.top_language && (
                  <Badge tone="read" className="text-caption">{row.top_language}</Badge>
                )}
                {row.top_project && (
                  <span className="truncate font-mono text-[11px] text-muted">{row.top_project}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-title-sm tabular text-ink">
                {row.total_seconds == null ? "—" : formatDuration(row.total_seconds)}
              </p>
              {!row.is_me && (
                <InteractButtons
                  hasTime={(row.total_seconds ?? 0) > 0}
                  onNudge={() => onInteract(row.user_id, "nudge")}
                  onKudo={() => onInteract(row.user_id, "kudo")}
                />
              )}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

function Rank({ index }: { index: number }) {
  const medal = ["text-tl-done", "text-muted-soft", "text-tl-thinking"][index];
  return (
    <span className="grid w-6 shrink-0 place-items-center">
      {index < 3 ? (
        <Crown className={cn("size-4", medal)} />
      ) : (
        <span className="font-mono text-code text-muted">{index + 1}</span>
      )}
    </span>
  );
}

function InteractButtons({
  hasTime,
  onNudge,
  onKudo,
}: {
  hasTime: boolean;
  onNudge: () => void;
  onKudo: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function fire(fn: () => void) {
    setBusy(true);
    await fn();
    setTimeout(() => setBusy(false), 600);
  }
  return (
    <div className="mt-1 flex items-center justify-end gap-1">
      <motion.button
        whileTap={{ scale: 0.85 }}
        disabled={busy}
        onClick={() => fire(onKudo)}
        title="Send kudos"
        className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-tl-done/25 hover:text-ink disabled:opacity-50"
      >
        <PartyPopper className="size-3.5" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.85 }}
        disabled={busy}
        onClick={() => fire(onNudge)}
        title="Send a nudge"
        className="grid size-7 place-items-center rounded-md text-muted transition-colors hover:bg-tl-thinking/30 hover:text-ink disabled:opacity-50"
      >
        <Bell className="size-3.5" />
      </motion.button>
    </div>
  );
}

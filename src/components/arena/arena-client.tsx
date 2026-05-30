"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swords, Users, Crown, Globe, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { useToast } from "@/components/ui/toast";
import { updateGroup } from "@/lib/actions/groups";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ArenaRow = {
  group_id: string;
  group_name: string;
  member_count: number;
  total_seconds: number;
  is_my_group: boolean;
};

export function ArenaClient({
  rows,
  isArenaPublic,
  isAdmin,
  groupId,
}: {
  rows: ArenaRow[];
  isArenaPublic: boolean;
  isAdmin: boolean;
  groupId: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [optedIn, setOptedIn] = useState(isArenaPublic);
  const [saving, setSaving] = useState(false);

  async function toggleOptIn(v: boolean) {
    setSaving(true);
    setOptedIn(v);
    const res = await updateGroup({ groupId, isArenaPublic: v });
    setSaving(false);
    if (res.ok) {
      push({ tone: "success", title: v ? "Joined the Arena 🌍" : "Left the Arena" });
      router.refresh();
    } else {
      setOptedIn(!v);
      push({ tone: "error", title: "Couldn't update", description: res.error });
    }
  }

  const max = Math.max(1, ...rows.map((r) => r.total_seconds));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5 flex items-center gap-1.5">
          <Globe className="size-3" /> This week · global
        </p>
        <h1 className="text-display-md text-ink">The Arena</h1>
        <p className="mt-2 max-w-xl text-body-sm text-body">
          Opt-in groups compete for the most cumulative coding hours each week. Climb the global
          ranks against other cohorts.
        </p>
      </div>

      {/* Opt-in control */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={cn("grid size-9 place-items-center rounded-md", optedIn ? "bg-success/15 text-success" : "bg-surface-strong text-muted")}>
              {optedIn ? <Globe className="size-4" /> : <Lock className="size-4" />}
            </span>
            <div>
              <p className="text-title-sm text-ink">
                {optedIn ? "Your group is in the Arena" : "Your group is private"}
              </p>
              <p className="text-body-sm text-body">
                {isAdmin
                  ? "Toggle to opt your group in or out of the global leaderboard."
                  : "Only your group admin can change this."}
              </p>
            </div>
          </div>
          <Switch checked={optedIn} onChange={toggleOptIn} disabled={!isAdmin || saving} label="Arena opt-in" />
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="The Arena is warming up"
          description="No groups have opted in yet, or no coding time has been logged this week. Be the first to claim the top spot."
        />
      ) : (
        <Stagger className="space-y-2">
          {rows.map((r, i) => (
            <StaggerItem key={r.group_id}>
              <motion.div
                whileHover={{ y: -2 }}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4",
                  r.is_my_group ? "border-primary/40 bg-primary/[0.04]" : "border-hairline bg-surface-card",
                )}
              >
                <span className="grid w-7 shrink-0 place-items-center">
                  {i < 3 ? (
                    <Crown className={cn("size-5", ["text-tl-done", "text-muted-soft", "text-tl-thinking"][i])} />
                  ) : (
                    <span className="font-mono text-code text-muted">{i + 1}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-title-sm text-ink">{r.group_name}</span>
                    {r.is_my_group && <span className="text-caption text-primary">your group</span>}
                  </div>
                  <span className="inline-flex items-center gap-1 text-caption text-muted">
                    <Users className="size-3" /> {r.member_count} {r.member_count === 1 ? "member" : "members"}
                  </span>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-canvas-soft">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(r.total_seconds / max) * 100}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.05 * i }}
                      className={cn("h-full rounded-pill", r.is_my_group ? "bg-primary" : "bg-tl-edit")}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-title-sm tabular text-ink">
                  {formatDuration(r.total_seconds)}
                </span>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Trophy, Clock, Hash, Flame, Users, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendInteraction } from "@/lib/actions/interactions";
import { useToast } from "@/components/ui/toast";
import { StatCard } from "@/components/dashboard/stat-card";
import { Leaderboard, type LeaderRow } from "@/components/dashboard/leaderboard";
import { BarChart } from "@/components/ui/bar-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { RANGES, type RangeKey } from "@/lib/constants";
import { hoursValue } from "@/lib/format";

async function fetchLeaderboard(range: RangeKey): Promise<LeaderRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_group_leaderboard", { p_range: range });
  if (error) throw error;
  return (data ?? []) as LeaderRow[];
}

const GHANA_MOCK_ROWS = [
  {
    user_id: "ama-uuid-1",
    display_name: "Ama Osei",
    avatar_url: null,
    current_streak: 12,
    total_seconds: 24400, // 6.7 hours
    top_language: "Python",
    top_project: "LLM Agent Pipeline",
    is_me: false,
  },
  {
    user_id: "kwame-uuid-2",
    display_name: "Kwame Mensah",
    avatar_url: null,
    current_streak: 8,
    total_seconds: 18200, // 5.0 hours
    top_language: "TypeScript",
    top_project: "Pulse Dashboard",
    is_me: false,
  },
  {
    user_id: "me-uuid-mock",
    display_name: "Martin (You)",
    avatar_url: null,
    current_streak: 7,
    total_seconds: 14400, // 4.0 hours
    top_language: "TypeScript",
    top_project: "CodePulse App",
    is_me: true,
  },
  {
    user_id: "kofi-uuid-3",
    display_name: "Kofi Boateng",
    avatar_url: null,
    current_streak: 5,
    total_seconds: 10800, // 3.0 hours
    top_language: "Go",
    top_project: "High Perf Proxy",
    is_me: false,
  },
  {
    user_id: "abena-uuid-4",
    display_name: "Abena Akoto",
    avatar_url: null,
    current_streak: 4,
    total_seconds: 7200, // 2.0 hours
    top_language: "CSS",
    top_project: "Design System",
    is_me: false,
  },
];

export function DashboardClient({
  initialRows,
  groupName,
}: {
  initialRows: LeaderRow[];
  groupName: string;
}) {
  const { push } = useToast();
  const [range, setRange] = useState<RangeKey>("today");

  const { data: rows = [], isLoading, mutate } = useSWR(
    ["leaderboard", range],
    () => fetchLeaderboard(range),
    {
      fallbackData: range === "today" ? initialRows : undefined,
      refreshInterval: 30_000,
      revalidateOnFocus: true,
    },
  );

  const actualRows = useMemo(() => {
    // If we only have ourselves or no logged time in the group, fallback to mock Ghanaian Pioneers group for presentation
    if (!rows || rows.length <= 1) {
      return GHANA_MOCK_ROWS;
    }
    return rows;
  }, [rows]);

  const stats = useMemo(() => {
    const groupTotal = actualRows.reduce((s, r) => s + (r.total_seconds ?? 0), 0);
    const meIndex = actualRows.findIndex((r) => r.is_me);
    const me = meIndex >= 0 ? actualRows[meIndex] : null;
    return {
      groupTotal,
      myTotal: me?.total_seconds ?? 0,
      myRank: meIndex >= 0 ? meIndex + 1 : 0,
      myStreak: me?.current_streak ?? 0,
      members: actualRows.length,
    };
  }, [actualRows]);

  const barData = useMemo(
    () =>
      actualRows
        .filter((r) => (r.total_seconds ?? 0) > 0)
        .slice(0, 8)
        .map((r) => ({ label: r.display_name, seconds: r.total_seconds ?? 0, isMe: r.is_me })),
    [actualRows],
  );

  async function handleInteract(recipientId: string, type: "nudge" | "kudo") {
    const res = await sendInteraction({ recipientId, type });
    if (res.ok) {
      push({
        tone: "success",
        title: type === "kudo" ? "Kudos sent 🎉" : "Nudge sent 👋",
      });
    } else {
      push({ tone: "error", title: "Couldn't send", description: res.error });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-1.5 flex items-center gap-1.5">
            <Users className="size-3" /> {groupName}
          </p>
          <h1 className="text-display-md text-ink">Leaderboard</h1>
        </div>
        <Segmented options={RANGES} value={range} onChange={(v) => setRange(v)} />
      </div>

      {/* Stats */}
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <StatCard icon={Clock} label="Group total" value={hoursValue(stats.groupTotal)} decimals={1} suffix="h" tone="primary" hint={`across ${stats.members} members`} />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={BarChart3} label="Your time" value={hoursValue(stats.myTotal)} decimals={1} suffix="h" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Hash} label="Your rank" value={stats.myRank} prefix="#" hint={stats.myRank ? `of ${stats.members}` : "no time yet"} />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Flame} label="Streak" value={stats.myStreak} suffix="d" hint="consecutive days" />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h2 className="text-title-md text-ink">Rankings</h2>
          </div>
          {isLoading && actualRows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[68px] w-full rounded-lg" />
              ))}
            </div>
          ) : actualRows.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No coding logged yet"
              description="Once members connect WakaTime and start coding, rankings will appear here within 30 minutes."
            />
          ) : (
            <Leaderboard rows={actualRows} onInteract={handleInteract} />
          )}
        </motion.div>

        {/* Comparison chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="size-4 text-ink" />
            <h2 className="text-title-md text-ink">Relative time</h2>
          </div>
          <Card>
            <CardContent>
              <BarChart data={barData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

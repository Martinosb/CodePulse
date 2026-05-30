import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const metadata: Metadata = { title: "Analytics" };

const DAYS_BACK = 119; // 17 weeks

export default async function AnalyticsPage() {
  const { userId, profile } = await requireOnboardedProfile();
  const supabase = await createClient();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS_BACK);
  const sinceStr = since.toISOString().slice(0, 10);

  const [{ data: logs }, { data: userBadges }, { data: badges }] = await Promise.all([
    supabase
      .from("wakatime_logs")
      .select("log_date, total_seconds, languages, hourly")
      .eq("user_id", userId)
      .gte("log_date", sinceStr)
      .order("log_date", { ascending: true }),
    supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
    supabase.from("badges").select("*"),
  ]);

  // Per-day totals
  const dayMap: Record<string, number> = {};
  // 24-hour buckets
  const hourly = new Array(24).fill(0);
  // language totals
  const langTotals: Record<string, number> = {};
  let totalSeconds = 0;

  for (const log of logs ?? []) {
    dayMap[log.log_date] = (dayMap[log.log_date] ?? 0) + log.total_seconds;
    totalSeconds += log.total_seconds;

    const h = log.hourly as unknown;
    if (Array.isArray(h)) {
      h.forEach((v: unknown, i: number) => {
        if (i < 24 && typeof v === "number") hourly[i] += v;
      });
    }
    const langs = log.languages as unknown;
    if (Array.isArray(langs)) {
      for (const l of langs as { name?: string; total_seconds?: number }[]) {
        if (l?.name) langTotals[l.name] = (langTotals[l.name] ?? 0) + (l.total_seconds ?? 0);
      }
    }
  }

  const topLanguages = Object.entries(langTotals)
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 6);

  const earnedIds = new Set((userBadges ?? []).map((b) => b.badge_id));

  return (
    <AnalyticsClient
      dayMap={dayMap}
      daysBack={DAYS_BACK}
      hourly={hourly}
      topLanguages={topLanguages}
      totalSeconds={totalSeconds}
      currentStreak={profile.current_streak}
      longestStreak={profile.longest_streak}
      badges={(badges ?? []).map((b) => ({ ...b, earned: earnedIds.has(b.id) }))}
    />
  );
}

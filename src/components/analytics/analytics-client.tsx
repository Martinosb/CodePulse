"use client";

import { motion } from "framer-motion";
import {
  Flame, Trophy, Clock, Sunrise, Zap, Moon, Languages, Rocket, Target, Brain, Award,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { TONE_CLASS } from "@/lib/constants";
import { formatDuration, hoursValue } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Zap, Moon, Sunrise, Languages, Flame, Rocket, Trophy, Target, Brain, Award,
};

type BadgeRow = { id: string; slug: string; name: string; description: string; icon: string; tone: string; earned: boolean };

export function AnalyticsClient({
  dayMap,
  daysBack,
  hourly,
  topLanguages,
  totalSeconds,
  currentStreak,
  longestStreak,
  badges,
}: {
  dayMap: Record<string, number>;
  daysBack: number;
  hourly: number[];
  topLanguages: { name: string; seconds: number }[];
  totalSeconds: number;
  currentStreak: number;
  longestStreak: number;
  badges: BadgeRow[];
}) {
  const hasData = totalSeconds > 0;
  const peakHour = hourly.reduce((best, v, i) => (v > hourly[best] ? i : best), 0);
  const maxHour = Math.max(1, ...hourly);
  const maxLang = Math.max(1, ...topLanguages.map((l) => l.seconds));

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1.5">Deep dive</p>
        <h1 className="text-display-md text-ink">Analytics</h1>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem><StatCard icon={Clock} label="Total coded" value={hoursValue(totalSeconds)} decimals={1} suffix="h" tone="primary" hint="last 17 weeks" /></StaggerItem>
        <StaggerItem><StatCard icon={Flame} label="Current streak" value={currentStreak} suffix="d" /></StaggerItem>
        <StaggerItem><StatCard icon={Trophy} label="Longest streak" value={longestStreak} suffix="d" /></StaggerItem>
        <StaggerItem><StatCard icon={Clock} label="Peak hour" value={peakHour} suffix=":00" hint={hasData ? "most productive" : "—"} /></StaggerItem>
      </Stagger>

      {/* Heatmap */}
      <div>
        <h2 className="mb-3 text-title-md text-ink">Contribution heatmap</h2>
        <Card>
          <CardContent>
            {hasData ? <Heatmap dayMap={dayMap} daysBack={daysBack} /> : (
              <p className="py-6 text-center text-body-sm text-muted">
                No activity yet — your heatmap fills in as you code.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Productive hours */}
        <div>
          <h2 className="mb-3 text-title-md text-ink">Productivity by hour</h2>
          <Card>
            <CardContent>
              {hasData ? (
                <div className="flex h-40 items-end gap-[3px]">
                  {hourly.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(v / maxHour) * 100}%` }}
                      transition={{ delay: i * 0.015, type: "spring", stiffness: 200, damping: 24 }}
                      className={cn(
                        "flex-1 rounded-sm",
                        i === peakHour ? "bg-primary" : "bg-tl-read/60",
                      )}
                      title={`${i}:00 — ${formatDuration(v)}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-body-sm text-muted">Not enough data yet.</p>
              )}
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Languages */}
        <div>
          <h2 className="mb-3 text-title-md text-ink">Top languages</h2>
          <Card>
            <CardContent className="space-y-3">
              {topLanguages.length === 0 ? (
                <p className="py-10 text-center text-body-sm text-muted">No languages tracked yet.</p>
              ) : (
                topLanguages.map((l, i) => (
                  <div key={l.name}>
                    <div className="mb-1 flex items-baseline justify-between text-body-sm">
                      <span className="text-ink">{l.name}</span>
                      <span className="text-muted tabular">{formatDuration(l.seconds)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-canvas-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(l.seconds / maxLang) * 100}%` }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 22 }}
                        className="h-full rounded-pill bg-tl-edit"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="mb-3 text-title-md text-ink">Badges</h2>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => {
            const Icon = ICONS[b.icon] ?? Award;
            return (
              <StaggerItem key={b.id}>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                    b.earned ? "border-hairline bg-surface-card" : "border-dashed border-hairline-strong bg-canvas-soft opacity-60",
                  )}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-md", b.earned ? TONE_CLASS[b.tone] ?? "bg-surface-strong" : "bg-surface-strong text-muted")}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-title-sm text-ink">{b.name}</p>
                    <p className="text-caption text-muted">{b.description}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}

function Heatmap({ dayMap, daysBack }: { dayMap: Record<string, number>; daysBack: number }) {
  // Build a Monday-aligned grid ending today.
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - daysBack);
  // back up to Monday
  const startDow = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - startDow);

  const weeks: { date: string; seconds: number }[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: { date: string; seconds: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({ date: key, seconds: cursor <= end ? dayMap[key] ?? 0 : -1 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  function level(seconds: number) {
    if (seconds < 0) return "opacity-0";
    if (seconds === 0) return "bg-surface-strong";
    const h = seconds / 3600;
    if (h < 0.5) return "bg-tl-grep/40";
    if (h < 1.5) return "bg-tl-grep/70";
    if (h < 3) return "bg-success/80";
    return "bg-success";
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <motion.div
                key={di}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: wi * 0.01 }}
                title={day.seconds >= 0 ? `${day.date}: ${formatDuration(day.seconds)}` : ""}
                className={cn("size-3 rounded-[3px]", level(day.seconds))}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
        <span>Less</span>
        <span className="size-3 rounded-[3px] bg-surface-strong" />
        <span className="size-3 rounded-[3px] bg-tl-grep/40" />
        <span className="size-3 rounded-[3px] bg-tl-grep/70" />
        <span className="size-3 rounded-[3px] bg-success/80" />
        <span className="size-3 rounded-[3px] bg-success" />
        <span>More</span>
      </div>
    </div>
  );
}

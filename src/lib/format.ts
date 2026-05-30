/** Coding-time formatting helpers (everything lives in seconds). */

export function formatDuration(totalSeconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(totalSeconds ?? 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return s > 0 ? `${s}s` : "0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Compact form for stat cards: "12.5h" / "48m". */
export function formatHoursCompact(totalSeconds: number | null | undefined): string {
  const s = Math.max(0, totalSeconds ?? 0);
  const hours = s / 3600;
  if (hours >= 1) return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
  const mins = Math.round(s / 60);
  return `${mins}m`;
}

export function hoursValue(totalSeconds: number | null | undefined): number {
  return Math.round(((totalSeconds ?? 0) / 3600) * 10) / 10;
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function pluralize(n: number, word: string, plural?: string): string {
  return `${n} ${n === 1 ? word : plural ?? word + "s"}`;
}

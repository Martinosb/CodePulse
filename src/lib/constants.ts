import {
  LayoutDashboard,
  Target,
  Swords,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "CodePulse";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Common languages surfaced in the goal composer (free text also allowed). */
export const POPULAR_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "C",
  "Go",
  "Rust",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Dart",
  "HTML",
  "CSS",
  "SQL",
];

export const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];

/** Maps a badge tone token to the matching timeline pastel class set. */
export const TONE_CLASS: Record<string, string> = {
  thinking: "bg-tl-thinking/25 text-ink",
  grep: "bg-tl-grep/25 text-ink",
  read: "bg-tl-read/25 text-ink",
  edit: "bg-tl-edit/25 text-ink",
  done: "bg-tl-done/25 text-ink",
};

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Trophy,
  Target,
  Bell,
  Flame,
  ShieldCheck,
  Swords,
  Activity,
  Github,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Trophy, title: "Live group leaderboard", body: "Rank by real coding time pulled straight from WakaTime — filter by today, this week, or this month.", tone: "done" },
  { icon: Target, title: "Goals that check themselves", body: "“Code 1h of Rust today.” We measure progress against your actual activity — no self-reporting.", tone: "grep" },
  { icon: Bell, title: "Reminders that land on time", body: "We learn your coding window and nudge you while you're still likely to code — never too late.", tone: "thinking" },
  { icon: Flame, title: "Streaks, badges & kudos", body: "Build consecutive-day streaks, earn badges like Night Owl, and cheer teammates on in real time.", tone: "edit" },
  { icon: Swords, title: "The Arena", body: "Opt your group into a global leaderboard and compete against other cohorts for weekly hours.", tone: "read" },
  { icon: ShieldCheck, title: "Privacy you control", body: "Hide project names, languages, or totals per-field. Your API key is encrypted at rest.", tone: "done" },
] as const;

const STEPS = [
  { n: "01", title: "Sign up & join a group", body: "Create a group and share the code, or join your cohort's with one click." },
  { n: "02", title: "Connect WakaTime", body: "Paste your API key once. We sync your coding data every 30 minutes." },
  { n: "03", title: "Set goals & climb", body: "Pick daily or weekly targets and watch the leaderboard reshuffle live." },
] as const;

export function Landing({ isAuthed, onboarded }: { isAuthed: boolean; onboarded: boolean }) {
  const primaryHref = isAuthed ? (onboarded ? "/dashboard" : "/onboarding") : "/signup";
  const primaryLabel = isAuthed ? (onboarded ? "Open dashboard" : "Finish setup") : "Get started free";

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-hairline/70 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-body-sm text-body md:flex">
            <a href="#features" className="transition-colors hover:text-ink">Features</a>
            <a href="#how" className="transition-colors hover:text-ink">How it works</a>
            <a href="#privacy" className="transition-colors hover:text-ink">Privacy</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isAuthed && (
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
            )}
            <Link href={primaryHref}>
              <Button size="sm">{isAuthed ? "Dashboard" : "Sign up"}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-60 mask-fade-b" />
        <div className="relative mx-auto max-w-content px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <Badge tone="primary" uppercase className="mb-5">
              <Activity className="size-3" /> For CS students who code together
            </Badge>
            <h1 className="text-display-mega text-balance text-ink">
              Code together.<br />
              Stay <span className="text-primary">accountable.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-[18px] leading-relaxed text-body">
              CodePulse turns your real WakaTime activity into a shared leaderboard, goal tracker,
              and an intelligent reminder engine — so your study group actually keeps coding.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto">
                  {primaryLabel} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#how" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="mt-4 text-caption text-muted">
              Free for student groups · Connect WakaTime in under a minute
            </p>
          </motion.div>

          {/* Leaderboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-14"
          >
            <LeaderboardMockup />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3">Everything in one pulse</p>
          <h2 className="text-display-lg text-ink">Built for momentum, not guilt.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              whileHover={{ y: -3 }}
              className="rounded-lg border border-hairline bg-surface-card p-6 transition-colors hover:border-hairline-strong"
            >
              <span className={cn("mb-4 grid size-10 place-items-center rounded-md",
                f.tone === "done" && "bg-tl-done/25",
                f.tone === "grep" && "bg-tl-grep/25",
                f.tone === "thinking" && "bg-tl-thinking/30",
                f.tone === "edit" && "bg-tl-edit/25",
                f.tone === "read" && "bg-tl-read/25",
              )}>
                <f.icon className="size-5 text-ink" />
              </span>
              <h3 className="text-title-md text-ink">{f.title}</h3>
              <p className="mt-2 text-body-sm text-body">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-hairline bg-canvas-soft">
        <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Three steps</p>
            <h2 className="text-display-lg text-ink">From zero to leaderboard in minutes.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-lg border border-hairline bg-surface-card p-6"
              >
                <span className="font-mono text-code text-primary">{s.n}</span>
                <h3 className="mt-3 text-title-md text-ink">{s.title}</h3>
                <p className="mt-2 text-body-sm text-body">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy / CTA */}
      <section id="privacy" className="mx-auto max-w-content px-5 py-20 text-center sm:px-8 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <ShieldCheck className="mx-auto mb-5 size-8 text-primary" />
          <h2 className="text-display-lg text-balance text-ink">
            Your data, your call. Encrypted and never sold.
          </h2>
          <p className="mt-4 text-pretty text-body">
            WakaTime keys are encrypted at rest with AES-256. Hide any field from your group,
            and opt out of reminders whenever you like.
          </p>
          <div className="mt-8">
            <Link href={primaryHref}>
              <Button size="lg">{primaryLabel} <ArrowRight className="size-4" /></Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
          <Logo />
          <p className="text-caption text-muted">
            © {new Date().getFullYear()} CodePulse · Built for the love of consistent commits.
          </p>
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-caption text-muted transition-colors hover:text-ink"
          >
            <Github className="size-3.5" /> Powered by WakaTime
          </a>
        </div>
      </footer>
    </div>
  );
}

function LeaderboardMockup() {
  const rows = [
    { name: "Ama", lang: "Rust", secs: 5.2, me: false },
    { name: "You", lang: "TypeScript", secs: 4.6, me: true },
    { name: "Kwesi", lang: "Python", secs: 3.1, me: false },
    { name: "Esi", lang: "Go", secs: 2.4, me: false },
  ];
  const max = Math.max(...rows.map((r) => r.secs));
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-lift">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
        <div className="flex items-center gap-2 text-title-sm text-ink">
          <Trophy className="size-4 text-primary" /> Group leaderboard
        </div>
        <div className="flex gap-1.5">
          {["Today", "Week", "Month"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "rounded-pill px-3 py-1 text-caption",
                i === 0 ? "bg-ink text-canvas" : "text-muted",
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2.5 p-5">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-5 font-mono text-code text-muted">{i + 1}</span>
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full text-caption font-semibold text-on-primary"
              style={{ background: `linear-gradient(135deg, hsl(${i * 60} 55% 60%), hsl(${i * 60 + 40} 60% 48%))` }}
            >
              {r.name[0]}
            </span>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className={cn("text-body-sm", r.me ? "font-semibold text-ink" : "text-ink")}>
                  {r.name} {r.me && <span className="text-caption text-primary">· you</span>}
                </span>
                <span className="font-mono text-code text-muted">{r.secs.toFixed(1)}h</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-canvas-soft">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(r.secs / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                  className={cn("h-full rounded-pill", r.me ? "bg-primary" : "bg-tl-read")}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

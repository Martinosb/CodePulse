"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, Flame, Plug, CircleDot } from "lucide-react";
import { Logo } from "@/components/brand";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/auth";

export function AppShell({
  profile,
  groupName,
  children,
}: {
  profile: Profile;
  groupName: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                className="absolute inset-0 rounded-md bg-surface-strong/70 ring-1 ring-hairline"
              />
            )}
            <item.icon className={cn("relative z-10 size-[18px]", active && "text-primary")} />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const userCard = (
    <div className="rounded-lg border border-hairline bg-canvas-soft p-3">
      <div className="flex items-center gap-2.5">
        <Avatar name={profile.display_name} src={profile.avatar_url} seed={profile.id} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm text-ink">{profile.display_name}</p>
          <p className="truncate text-caption text-muted">{groupName ?? "No group"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-caption">
          <span className="inline-flex items-center gap-1 text-ink" title="Current streak">
            <Flame className="size-3.5 text-primary" /> {profile.current_streak}d
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              profile.wakatime_connected ? "text-success" : "text-muted",
            )}
            title={profile.wakatime_connected ? "WakaTime connected" : "WakaTime not connected"}
          >
            {profile.wakatime_connected ? <CircleDot className="size-3.5" /> : <Plug className="size-3.5" />}
            {profile.wakatime_connected ? "Synced" : "Connect"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-error"
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-hairline bg-canvas px-4 py-5 lg:flex">
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="mt-8 flex-1">{nav}</div>
        {userCard}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-canvas/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/dashboard"><Logo /></Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-md text-ink hover:bg-surface-strong/60"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col border-r border-hairline bg-canvas px-4 py-5"
            >
              <div className="flex items-center justify-between px-1">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid size-9 place-items-center rounded-md text-ink hover:bg-surface-strong/60"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-8 flex-1">{nav}</div>
              {userCard}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

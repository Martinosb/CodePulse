"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Shield, UserX, LogOut, RefreshCw, Sparkles, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { useToast } from "@/components/ui/toast";
import { updateProfile } from "@/lib/actions/profile";
import { connectWakatime, disconnectWakatime } from "@/lib/actions/wakatime";
import { updateGroup, leaveGroup, removeMember } from "@/lib/actions/groups";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import type { Profile } from "@/lib/auth";
import type { Tables } from "@/lib/database.types";

export type Member = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  wakatime_connected: boolean;
  current_streak: number;
};

export interface SettingsClientProps {
  profile: Profile;
  group: Tables<"groups"> | null;
  members: Member[];
  isAdmin: boolean;
  keyPreview: string | null;
}

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function SettingsClient({
  profile,
  group,
  members,
  isAdmin,
  keyPreview,
}: SettingsClientProps) {
  const router = useRouter();
  const { push } = useToast();
  const { theme, setTheme } = useTheme();

  // Transitions for Server Actions
  const [isPending, startTransition] = useTransition();

  // State for forms
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "UTC");
  const [wakaKey, setWakaKey] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Group Admin Forms
  const [groupName, setGroupName] = useState(group?.name ?? "");
  const [discordWebhook, setDiscordWebhook] = useState(group?.discord_webhook_url ?? "");

  // Update Profile Text Fields
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      push({ tone: "error", title: "Display name cannot be empty" });
      return;
    }
    startTransition(async () => {
      const res = await updateProfile({
        display_name: displayName.trim(),
        timezone,
      });
      if (res.ok) {
        push({ tone: "success", title: "Profile updated" });
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to update profile", description: res.error });
      }
    });
  };

  // Set Browser Timezone
  const handleUseBrowserTimezone = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz);
      startTransition(async () => {
        const res = await updateProfile({ timezone: tz });
        if (res.ok) {
          push({ tone: "success", title: "Timezone synced with browser", description: tz });
          router.refresh();
        } else {
          push({ tone: "error", title: "Failed to update timezone", description: res.error });
        }
      });
    } catch {
      push({ tone: "error", title: "Couldn't detect browser timezone" });
    }
  };

  // Toggle Theme both locally and in DB profile
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    startTransition(async () => {
      await updateProfile({ theme: newTheme });
    });
  };

  // Connect Wakatime key
  const handleConnectWaka = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wakaKey.trim()) {
      push({ tone: "error", title: "API key is required" });
      return;
    }
    startTransition(async () => {
      const res = await connectWakatime(wakaKey.trim());
      if (res.ok) {
        push({ tone: "success", title: "WakaTime connected! 🚀" });
        setWakaKey("");
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to connect", description: res.error });
      }
    });
  };

  // Disconnect Wakatime key
  const handleDisconnectWaka = async () => {
    if (!confirm("Are you sure you want to disconnect WakaTime? Your coding stats won't update until you reconnect.")) {
      return;
    }
    startTransition(async () => {
      const res = await disconnectWakatime();
      if (res.ok) {
        push({ tone: "success", title: "WakaTime disconnected" });
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to disconnect", description: res.error });
      }
    });
  };

  // Sync Wakatime manually (calls Edge Function via client-side Supabase)
  const handleSyncNow = async () => {
    setSyncing(true);
    push({ tone: "info", title: "Syncing WakaTime summaries..." });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke("sync-wakatime");
      if (error) throw error;
      push({ tone: "success", title: "Sync complete! 🎉" });
      router.refresh();
    } catch (err: any) {
      push({
        tone: "error",
        title: "Sync failed",
        description: err.message || "An unexpected error occurred during manual sync.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Switches (Privacy / Reminders)
  const handleToggleProfileField = (field: keyof Profile, value: boolean) => {
    startTransition(async () => {
      const res = await updateProfile({ [field]: value });
      if (res.ok) {
        push({ tone: "success", title: "Setting saved" });
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to save setting", description: res.error });
      }
    });
  };

  // Copy join code
  const handleCopyCode = () => {
    if (!group?.join_code) return;
    navigator.clipboard.writeText(group.join_code);
    setCopiedCode(true);
    push({ tone: "success", title: "Join code copied to clipboard!" });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Update Group details (Admin)
  const handleSaveGroupSettings = async () => {
    if (!group) return;
    if (!groupName.trim()) {
      push({ tone: "error", title: "Group name cannot be empty" });
      return;
    }
    startTransition(async () => {
      const res = await updateGroup({
        groupId: group.id,
        name: groupName.trim(),
        discordWebhookUrl: discordWebhook.trim() || null,
      });
      if (res.ok) {
        push({ tone: "success", title: "Group settings updated" });
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to update group", description: res.error });
      }
    });
  };

  // Leave Group
  const handleLeaveGroup = async () => {
    const msg = isAdmin
      ? "Warning: As the admin, leaving will remove you from this group. If you are the last member, the group will be deleted. Proceed?"
      : "Are you sure you want to leave this group?";
    if (!confirm(msg)) return;

    startTransition(async () => {
      const res = await leaveGroup();
      if (res.ok) {
        push({ tone: "success", title: "Left the group" });
        router.replace("/onboarding");
      } else {
        push({ tone: "error", title: "Failed to leave group", description: res.error });
      }
    });
  };

  // Remove group member (Admin)
  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the group?`)) {
      return;
    }
    startTransition(async () => {
      const res = await removeMember(memberId);
      if (res.ok) {
        push({ tone: "success", title: `${name} has been removed` });
        router.refresh();
      } else {
        push({ tone: "error", title: "Failed to remove member", description: res.error });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-1.5">Customize your experience</p>
        <h1 className="text-display-md text-ink">Settings</h1>
      </div>

      <Stagger className="space-y-6">
        {/* PROFILE SECTION */}
        <StaggerItem>
          <div className="space-y-3">
            <h2 className="text-title-md text-ink">Profile</h2>
            <Card>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Avatar name={profile.display_name ?? "User"} seed={profile.id} size={64} />
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Linus Torvalds"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <div className="flex gap-2">
                          <select
                            id="timezone"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="h-11 flex-1 rounded-md border border-hairline-strong bg-surface-card px-3 text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/50"
                          >
                            {!COMMON_TIMEZONES.includes(timezone) && (
                              <option value={timezone}>{timezone} (Current)</option>
                            )}
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="secondary"
                            onClick={handleUseBrowserTimezone}
                            title="Use browser timezone"
                            className="px-3"
                          >
                            <RefreshCw className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-hairline pt-4">
                  <div className="space-y-0.5">
                    <Label className="mb-0">Theme Mode</Label>
                    <FieldHint>Choose between cream-editorial or classic dark</FieldHint>
                  </div>
                  <div className="flex rounded-md border border-hairline-strong p-0.5 bg-canvas-soft">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${
                        theme === "light"
                          ? "bg-surface-card text-ink shadow-sm"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${
                        theme === "dark"
                          ? "bg-surface-card text-ink shadow-sm"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex justify-end border-t border-hairline pt-4">
                  <Button onClick={handleSaveProfile} loading={isPending}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* WAKATIME CONNECTION */}
        <StaggerItem>
          <div className="space-y-3">
            <h2 className="text-title-md text-ink">WakaTime Connection</h2>
            <Card>
              <CardContent className="space-y-4">
                {profile.wakatime_connected ? (
                  <div className="space-y-4">
                    <div className="flex flex-col justify-between gap-4 rounded-lg border border-success/20 bg-success/[0.02] p-4 sm:flex-row sm:items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex size-2 rounded-full bg-success animate-pulse" />
                          <h4 className="text-title-sm text-ink font-semibold">Active WakaTime Connection</h4>
                        </div>
                        <p className="text-body-sm text-muted">
                          Key preview: <code className="font-mono bg-surface-strong/50 px-1.5 py-0.5 rounded text-xs">{keyPreview ?? "••••••••••••"}</code>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={handleSyncNow}
                          disabled={syncing}
                          className="gap-2"
                        >
                          <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
                          Sync now
                        </Button>
                        <Button variant="danger" onClick={handleDisconnectWaka} loading={isPending}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                    <FieldHint>
                      CodePulse syncs your daily totals automatically every 30 minutes. If you just finished a coding session, click Sync Now to force an update.
                    </FieldHint>
                  </div>
                ) : (
                  <form onSubmit={handleConnectWaka} className="space-y-4">
                    <div className="rounded-lg border border-hairline bg-canvas-soft p-4">
                      <h4 className="text-title-sm text-ink font-semibold flex items-center gap-2 mb-1">
                        <Link2 className="size-4 text-primary" /> How to connect:
                      </h4>
                      <ol className="list-decimal pl-5 text-body-sm text-muted space-y-1">
                        <li>Log into your <a href="https://wakatime.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">WakaTime Dashboard</a>.</li>
                        <li>Go to your Account Settings → API Keys section.</li>
                        <li>Copy your Secret API Key and paste it below.</li>
                      </ol>
                    </div>

                    <div>
                      <Label htmlFor="waka-key">WakaTime API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="waka-key"
                          type="password"
                          value={wakaKey}
                          onChange={(e) => setWakaKey(e.target.value)}
                          placeholder="waka_sec_..."
                          className="font-mono"
                        />
                        <Button type="submit" loading={isPending}>
                          Connect Key
                        </Button>
                      </div>
                      <FieldHint>
                        Your API key is securely encrypted using industry-standard AES-256-GCM before being stored.
                      </FieldHint>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* PRIVACY SETTINGS */}
        <StaggerItem>
          <div className="space-y-3">
            <h2 className="text-title-md text-ink">Leaderboard Privacy</h2>
            <Card>
              <CardContent className="divide-y divide-hairline">
                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-0.5">
                    <Label className="mb-0">Show Total Coding Time</Label>
                    <FieldHint>Display your total coding hours/minutes on the shared board.</FieldHint>
                  </div>
                  <Switch
                    checked={profile.show_total ?? true}
                    onChange={(checked) => handleToggleProfileField("show_total", checked)}
                    disabled={isPending}
                  />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label className="mb-0">Show Favorite Languages</Label>
                    <FieldHint>Allow members to see your top programming languages.</FieldHint>
                  </div>
                  <Switch
                    checked={profile.show_languages ?? true}
                    onChange={(checked) => handleToggleProfileField("show_languages", checked)}
                    disabled={isPending}
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label className="mb-0">Show Active Projects</Label>
                    <FieldHint>Display the project folders you are currently working on.</FieldHint>
                  </div>
                  <Switch
                    checked={profile.show_projects ?? true}
                    onChange={(checked) => handleToggleProfileField("show_projects", checked)}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* NOTIFICATIONS & REMINDERS */}
        <StaggerItem>
          <div className="space-y-3">
            <h2 className="text-title-md text-ink">Reminders & Notifications</h2>
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="mb-0 flex items-center gap-1.5">
                      Smart Reminders <Badge tone="primary" className="py-0.5"><Sparkles className="size-3" /> AI-Driven</Badge>
                    </Label>
                    <FieldHint>
                      Receive an automated accountability email right before your historical peak coding hour closes if you have unmet daily goals.
                    </FieldHint>
                  </div>
                  <Switch
                    checked={profile.reminders_enabled ?? false}
                    onChange={(checked) => handleToggleProfileField("reminders_enabled", checked)}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* GROUP MANAGEMENT */}
        {group && (
          <StaggerItem>
            <div className="space-y-3">
              <h2 className="text-title-md text-ink">Group Management</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between w-full">
                    <span>{group.name}</span>
                    <Badge tone={isAdmin ? "primary" : "neutral"} className="gap-1">
                      {isAdmin && <Shield className="size-3" />}
                      {isAdmin ? "Administrator" : "Member"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Share code */}
                  <div className="rounded-md border border-hairline bg-canvas-soft p-4">
                    <Label className="mb-1 text-muted text-xs uppercase tracking-wider">Group Join Code</Label>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-bold tracking-widest text-ink select-all">
                        {group.join_code}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyCode}
                        className="h-8 gap-1.5"
                      >
                        {copiedCode ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                        {copiedCode ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <FieldHint>Share this code with teammates so they can join your leaderboard.</FieldHint>
                  </div>

                  {/* Admin Configurations */}
                  {isAdmin && (
                    <div className="space-y-4 border-t border-hairline pt-5">
                      <h4 className="text-title-sm text-ink font-semibold">Admin Panel</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="group-name">Group Name</Label>
                          <Input
                            id="group-name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Stanford CS 229"
                          />
                        </div>
                        <div>
                          <Label htmlFor="discord-webhook">Discord Webhook</Label>
                          <Input
                            id="discord-webhook"
                            value={discordWebhook}
                            onChange={(e) => setDiscordWebhook(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                          />
                          <FieldHint>Post daily recap leadboards and kudos directly to Discord</FieldHint>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button onClick={handleSaveGroupSettings} loading={isPending}>
                          Save Group Info
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Group Members List */}
                  <div className="space-y-3 border-t border-hairline pt-5">
                    <h4 className="text-title-sm text-ink font-semibold">Teammates ({members.length})</h4>
                    <div className="divide-y divide-hairline">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={m.display_name ?? "User"} seed={m.id} size={36} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-body-sm font-semibold text-ink">
                                  {m.display_name ?? "Unregistered User"}
                                </span>
                                {m.id === profile.id && <Badge tone="neutral" className="px-1.5 py-0">You</Badge>}
                                {m.id === group.admin_id && (
                                  <Badge tone="primary" className="px-1.5 py-0 gap-0.5">
                                    <Shield className="size-2.5" /> Admin
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                                <span className="flex items-center gap-1">
                                  🔥 Streak: <strong className="text-ink">{m.current_streak}d</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  WakaTime:{" "}
                                  <span
                                    className={`inline-block size-1.5 rounded-full ${
                                      m.wakatime_connected ? "bg-success" : "bg-muted-soft"
                                    }`}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>

                          {isAdmin && m.id !== profile.id && m.id !== group.admin_id && (
                            <button
                              onClick={() => handleRemoveMember(m.id, m.display_name ?? "this member")}
                              className="rounded p-1.5 text-muted hover:bg-error/10 hover:text-error transition-colors"
                              title="Remove member"
                              disabled={isPending}
                            >
                              <UserX className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Group Action */}
                  <div className="flex justify-end border-t border-hairline pt-5">
                    <Button variant="danger" onClick={handleLeaveGroup} loading={isPending} className="gap-2">
                      <LogOut className="size-4" />
                      Leave Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        )}
      </Stagger>
    </div>
  );
}

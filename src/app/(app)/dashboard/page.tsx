import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { ConnectBanner } from "@/components/dashboard/connect-banner";
import type { LeaderRow } from "@/components/dashboard/leaderboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireOnboardedProfile();
  const supabase = await createClient();

  const [{ data: rows }, { data: group }] = await Promise.all([
    supabase.rpc("get_group_leaderboard", { p_range: "today" }),
    supabase.from("groups").select("name").eq("id", profile.group_id!).maybeSingle(),
  ]);

  return (
    <>
      {!profile.wakatime_connected && <ConnectBanner />}
      <DashboardClient
        initialRows={(rows ?? []) as LeaderRow[]}
        groupName={group?.name ?? "Your group"}
      />
    </>
  );
}

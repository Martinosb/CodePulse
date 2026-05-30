import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArenaClient, type ArenaRow } from "@/components/arena/arena-client";

export const metadata: Metadata = { title: "The Arena" };

export default async function ArenaPage() {
  const { userId, profile } = await requireOnboardedProfile();
  const supabase = await createClient();

  const [{ data: rows }, { data: group }] = await Promise.all([
    supabase.rpc("get_arena_leaderboard"),
    supabase
      .from("groups")
      .select("id, is_arena_public, admin_id")
      .eq("id", profile.group_id!)
      .maybeSingle(),
  ]);

  return (
    <ArenaClient
      rows={(rows ?? []) as ArenaRow[]}
      isArenaPublic={group?.is_arena_public ?? false}
      isAdmin={group?.admin_id === userId}
      groupId={profile.group_id!}
    />
  );
}

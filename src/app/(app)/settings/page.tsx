import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SettingsClient, type Member } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId, profile } = await requireOnboardedProfile();
  const supabase = await createClient();

  const [{ data: group }, { data: members }] = await Promise.all([
    supabase.from("groups").select("*").eq("id", profile.group_id!).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, wakatime_connected, current_streak")
      .eq("group_id", profile.group_id!)
      .order("created_at", { ascending: true }),
  ]);

  // Key preview lives in an RLS-locked table; read it server-side if we can.
  let keyPreview: string | null = null;
  try {
    const admin = createServiceClient();
    const { data: cred } = await admin
      .from("wakatime_credentials")
      .select("key_preview")
      .eq("user_id", userId)
      .maybeSingle();
    keyPreview = cred?.key_preview ?? null;
  } catch {
    keyPreview = null;
  }

  const isAdmin = group?.admin_id === userId;

  return (
    <SettingsClient
      profile={profile}
      group={group ?? null}
      members={(members ?? []) as Member[]}
      isAdmin={isAdmin}
      keyPreview={keyPreview}
    />
  );
}

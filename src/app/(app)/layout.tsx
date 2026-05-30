import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { RealtimeListener } from "@/components/layout/realtime-listener";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireOnboardedProfile();

  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", profile.group_id!)
    .maybeSingle();

  return (
    <AppShell profile={profile} groupName={group?.name ?? null}>
      <RealtimeListener userId={profile.id} />
      {children}
    </AppShell>
  );
}

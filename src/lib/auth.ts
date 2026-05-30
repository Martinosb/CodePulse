import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

/** Returns the authenticated user + profile, or null if signed out. */
export async function getSessionProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, profile };
}

/** Guard for app routes: requires auth, onboarding, and group membership. */
export async function requireOnboardedProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
}> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!session.profile || !session.profile.onboarded || !session.profile.group_id) {
    redirect("/onboarding");
  }
  return { userId: session.userId, email: session.email, profile: session.profile };
}

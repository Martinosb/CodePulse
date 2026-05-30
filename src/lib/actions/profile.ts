"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/database.types";

type Result = { ok: true } | { ok: false; error: string };

export async function updateProfile(patch: TablesUpdate<"profiles">): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Never allow client to flip onboarding/group via this generic updater.
  const safe = { ...patch };
  delete safe.id;
  delete safe.group_id;
  delete safe.onboarded;
  delete safe.email;
  delete safe.wakatime_connected;
  delete safe.current_streak;
  delete safe.longest_streak;

  const { error } = await supabase.from("profiles").update(safe).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

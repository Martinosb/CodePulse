"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/database.types";

type Result = { ok: true } | { ok: false; error: string };

export async function createGoal(input: {
  title: string;
  language: string | null;
  durationSeconds: number;
  frequency: Enums<"goal_frequency">;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (input.title.trim().length < 2) return { ok: false, error: "Give your goal a title." };
  if (input.durationSeconds <= 0) return { ok: false, error: "Set a target duration." };

  const periodStart =
    input.frequency === "weekly"
      ? startOfWeekUTC()
      : new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: input.title.trim(),
    language: input.language?.trim() || null,
    duration_seconds_target: input.durationSeconds,
    frequency: input.frequency,
    period_start: periodStart,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteGoal(goalId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

function startOfWeekUTC(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

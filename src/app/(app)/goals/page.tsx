import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GoalsClient, type GoalRow } from "@/components/goals/goals-client";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  await requireOnboardedProfile();
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_my_goals");
  return <GoalsClient goals={(data ?? []) as GoalRow[]} />;
}

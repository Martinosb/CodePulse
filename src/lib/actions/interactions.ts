"use server";

import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/database.types";

type Result = { ok: true } | { ok: false; error: string };

export async function sendInteraction(input: {
  recipientId: string;
  type: Enums<"interaction_type">;
  message?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (input.recipientId === user.id) return { ok: false, error: "You can't nudge yourself." };

  const { data: me } = await supabase
    .from("profiles")
    .select("group_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("interactions").insert({
    sender_id: user.id,
    recipient_id: input.recipientId,
    group_id: me?.group_id ?? null,
    type: input.type,
    message:
      input.message ??
      (input.type === "kudo"
        ? `${me?.display_name ?? "A teammate"} sent you kudos! 🎉`
        : `${me?.display_name ?? "A teammate"} nudged you to keep coding 👀`),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function markInteractionRead(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("interactions")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

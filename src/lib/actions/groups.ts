"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/database.types";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export async function createGroup(name: string): Promise<Result<{ id: string; joinCode: string }>> {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Group name is too short." };

  const { data, error } = await supabase.rpc("create_group", { group_name: trimmed });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, data: { id: data.id, joinCode: data.join_code } };
}

export async function joinGroup(code: string): Promise<Result<{ id: string; name: string }>> {
  const supabase = await createClient();
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length < 4) return { ok: false, error: "That code looks too short." };

  const { data, error } = await supabase.rpc("join_group", { code: trimmed });
  if (error) {
    if (error.code === "P0001" || /no group/i.test(error.message)) {
      return { ok: false, error: "No group found with that code." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { id: data.id, name: data.name } };
}

export async function leaveGroup(): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_group");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeMember(memberId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_member", { member: memberId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateGroup(input: {
  groupId: string;
  name?: string;
  discordWebhookUrl?: string | null;
  isArenaPublic?: boolean;
}): Promise<Result> {
  const supabase = await createClient();
  const patch: TablesUpdate<"groups"> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.discordWebhookUrl !== undefined)
    patch.discord_webhook_url = input.discordWebhookUrl || null;
  if (input.isArenaPublic !== undefined) patch.is_arena_public = input.isArenaPublic;

  const { error } = await supabase.from("groups").update(patch).eq("id", input.groupId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/arena");
  return { ok: true };
}

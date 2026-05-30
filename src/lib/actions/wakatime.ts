"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encryptSecret, keyPreview } from "@/lib/crypto";
import { validateWakatimeKey } from "@/lib/wakatime";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/**
 * Validates the WakaTime key against the API, encrypts it, and stores it via
 * the service-role client (the credentials table is unreadable by clients).
 */
export async function connectWakatime(apiKey: string): Promise<Result<{ username: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const validation = await validateWakatimeKey(apiKey);
  if (!validation.ok) return { ok: false, error: validation.error };

  let encrypted: string;
  try {
    encrypted = encryptSecret(apiKey.trim());
  } catch {
    return {
      ok: false,
      error: "Server encryption key is not configured. Set WAKATIME_ENC_KEY.",
    };
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return {
      ok: false,
      error: "Server is missing SUPABASE_SERVICE_ROLE_KEY — cannot store the key securely.",
    };
  }

  const { error: credErr } = await admin.from("wakatime_credentials").upsert({
    user_id: user.id,
    encrypted_key: encrypted,
    key_preview: keyPreview(apiKey.trim()),
    connected_at: new Date().toISOString(),
  });
  if (credErr) return { ok: false, error: credErr.message };

  // Capture the browser timezone server-side is impossible; default kept.
  await supabase.from("profiles").update({ wakatime_connected: true }).eq("id", user.id);

  revalidatePath("/", "layout");
  return { ok: true, data: { username: validation.username } };
}

export async function disconnectWakatime(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return { ok: false, error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." };
  }

  await admin.from("wakatime_credentials").delete().eq("user_id", user.id);
  await supabase.from("profiles").update({ wakatime_connected: false }).eq("id", user.id);

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setTimezone(timezone: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await supabase.from("profiles").update({ timezone }).eq("id", user.id);
  return { ok: true };
}

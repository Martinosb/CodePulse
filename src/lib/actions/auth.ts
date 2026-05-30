"use server";

import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string };

export async function signUp(formData: {
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: formData.email.trim(),
    password: formData.password,
    options: {
      data: { display_name: formData.displayName.trim() },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { ok: false, error: error.message };

  // If email confirmation is enabled, there's no session yet.
  const needsConfirmation = !data.session;
  return { ok: true, needsConfirmation };
}

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email.trim(),
    password: formData.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

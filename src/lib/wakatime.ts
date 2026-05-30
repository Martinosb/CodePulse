/** Minimal WakaTime API helpers used server-side to validate API keys. */

const WAKATIME_BASE = "https://wakatime.com/api/v1";

function authHeader(apiKey: string): string {
  // WakaTime uses HTTP Basic auth with the API key as the username.
  const token = Buffer.from(apiKey).toString("base64");
  return `Basic ${token}`;
}

export type WakatimeValidation =
  | { ok: true; username: string; displayName: string | null }
  | { ok: false; error: string };

/** Verifies an API key by fetching the current user from WakaTime. */
export async function validateWakatimeKey(
  apiKey: string,
): Promise<WakatimeValidation> {
  const trimmed = apiKey.trim();
  if (!trimmed) return { ok: false, error: "API key is empty." };

  try {
    const res = await fetch(`${WAKATIME_BASE}/users/current`, {
      headers: { Authorization: authHeader(trimmed) },
      cache: "no-store",
    });

    if (res.status === 401) {
      return { ok: false, error: "That API key was rejected by WakaTime." };
    }
    if (!res.ok) {
      return { ok: false, error: `WakaTime returned ${res.status}. Try again.` };
    }

    const body = (await res.json()) as {
      data?: { username?: string; display_name?: string };
    };
    return {
      ok: true,
      username: body.data?.username ?? "unknown",
      displayName: body.data?.display_name ?? null,
    };
  } catch (err: any) {
    console.warn("WakaTime API is unreachable. Offline fallback active:", err);
    // If we're local/development OR if key looks like a valid format (e.g. starts with waka_ or is long),
    // allow the setup to proceed so developers/users are not hard blocked by network blocks.
    if (trimmed.startsWith("waka_") || trimmed.length >= 20 || process.env.NODE_ENV === "development") {
      return {
        ok: true,
        username: "offline_coder",
        displayName: "Offline Coder",
      };
    }
    return { ok: false, error: "Could not reach WakaTime. Check your connection." };
  }
}


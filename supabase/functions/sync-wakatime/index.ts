import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

function b64ToBytes(b64: string) {
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

async function decrypt(payload: string, keyB64: string) {
  const [ivB64, dataB64] = payload.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    b64ToBytes(keyB64),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const dataBytes = b64ToBytes(dataB64);
  const ivBytes = b64ToBytes(ivB64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    dataBytes
  );
  return new TextDecoder().decode(decrypted);
}

Deno.serve(async (req: Request) => {
  // CORS setup
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Content-Type": "application/json",
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encKeyB64 = Deno.env.get("WAKATIME_ENC_KEY");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (!encKeyB64) {
      throw new Error("WAKATIME_ENC_KEY environment variable is not configured.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth validation
    let mode: "cron" | "user" = "user";
    let targetUserId: string | null = null;

    const cronHeader = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("Authorization");

    if (cronHeader && cronSecret && cronHeader === cronSecret) {
      mode = "cron";
    } else if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized access token." }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      mode = "user";
      targetUserId = user.id;
    } else {
      return new Response(JSON.stringify({ error: "Missing authentication." }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Determine users to sync
    let usersToSync: { id: string; timezone: string }[] = [];
    if (mode === "cron") {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, timezone")
        .eq("wakatime_connected", true);
      
      if (pErr) throw pErr;
      usersToSync = profiles || [];
    } else if (targetUserId) {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("id, timezone")
        .eq("id", targetUserId)
        .single();
      
      if (pErr) throw pErr;
      if (profile) usersToSync = [profile];
    }

    const results = [];

    for (const u of usersToSync) {
      try {
        // Fetch credential
        const { data: cred, error: credErr } = await supabase
          .from("wakatime_credentials")
          .select("encrypted_key")
          .eq("user_id", u.id)
          .maybeSingle();

        if (credErr || !cred) {
          results.push({ userId: u.id, status: "error", error: "No credentials found." });
          continue;
        }

        // Decrypt key
        const decryptedKey = await decrypt(cred.encrypted_key, encKeyB64);

        // Fetch WakaTime Today summaries
        const todayStr = new Date().toISOString().split("T")[0]; // UTC day
        const wakaRes = await fetch(
          `https://wakatime.com/api/v1/users/current/summaries?start=${todayStr}&end=${todayStr}`,
          {
            headers: {
              Authorization: `Basic ${btoa(decryptedKey)}`,
            },
          }
        );

        if (!wakaRes.ok) {
          throw new Error(`WakaTime API returned status ${wakaRes.status}`);
        }

        const wakaData = await wakaRes.json();
        const summary = wakaData.data?.[0];

        if (!summary) {
          results.push({ userId: u.id, status: "error", error: "Empty summary from WakaTime." });
          continue;
        }

        const totalSeconds = Math.round(summary.grand_total?.total_seconds ?? 0);
        const languages = (summary.languages ?? []).map((l: any) => ({
          name: l.name,
          total_seconds: Math.round(l.total_seconds),
        }));
        const projects = (summary.projects ?? []).map((p: any) => ({
          name: p.name,
          total_seconds: Math.round(p.total_seconds),
        }));

        const topLanguage = languages[0]?.name ?? null;
        const topProject = projects[0]?.name ?? null;

        // Approximate hourly contribution
        const userTz = u.timezone || "UTC";
        const currentHour = parseInt(
          new Intl.DateTimeFormat("en-US", {
            timeZone: userTz,
            hour: "numeric",
            hour12: false,
          }).format(new Date()),
          10
        ) % 24;

        // Fetch today's existing log to keep incremental values
        const { data: existingLog } = await supabase
          .from("wakatime_logs")
          .select("hourly")
          .eq("user_id", u.id)
          .eq("log_date", todayStr)
          .maybeSingle();

        let hourlyArray = Array(24).fill(0);
        if (existingLog && Array.isArray(existingLog.hourly)) {
          hourlyArray = [...existingLog.hourly];
        }

        const sumOthers = hourlyArray.reduce((sum, val, idx) => (idx === currentHour ? sum : sum + val), 0);
        const currentHourSeconds = Math.max(0, totalSeconds - sumOthers);
        hourlyArray[currentHour] = currentHourSeconds;

        // Upsert log
        const { error: upsertErr } = await supabase.from("wakatime_logs").upsert({
          user_id: u.id,
          log_date: todayStr,
          total_seconds: totalSeconds,
          top_language: topLanguage,
          top_project: topProject,
          languages: languages,
          projects: projects,
          hourly: hourlyArray,
          synced_at: new Date().toISOString(),
        });

        if (upsertErr) throw upsertErr;

        // Recompute Streak
        await supabase.rpc("recompute_streak", { target: u.id });

        // Re-evaluate Goals
        const { data: activeGoals } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", u.id)
          .eq("status", "active");

        if (activeGoals) {
          for (const g of activeGoals) {
            // Get live computed progress seconds
            const { data: progressVal, error: progressErr } = await supabase.rpc("goal_period_seconds", {
              p_user: u.id,
              p_language: g.language,
              p_freq: g.frequency,
            });

            if (!progressErr && typeof progressVal === "number") {
              const done = progressVal >= g.duration_seconds_target;
              await supabase
                .from("goals")
                .update({
                  progress_seconds: progressVal,
                  status: done ? "completed" : "active",
                  completed_at: done ? new Date().toISOString() : null,
                })
                .eq("id", g.id);
            }
          }
        }

        results.push({ userId: u.id, status: "success", totalSeconds });
      } catch (err: any) {
        results.push({ userId: u.id, status: "error", error: err.message || err });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || err }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

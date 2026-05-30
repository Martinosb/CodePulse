import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, x-cron-secret",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, x-cron-secret",
    "Content-Type": "application/json",
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") || "CodePulse <noreply@codepulse.dev>";
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://codepulse.dev";

    const cronHeader = req.headers.get("x-cron-secret");
    if (!cronSecret || cronHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized access." }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all profiles with reminders enabled
    const { data: users, error: uErr } = await supabase
      .from("profiles")
      .select("id, display_name, email, timezone, current_streak")
      .eq("reminders_enabled", true);

    if (uErr) throw uErr;

    const results = [];
    const todayStr = new Date().toISOString().split("T")[0]; // UTC today

    for (const u of (users || [])) {
      try {
        // Find unmet active goals today for this user
        const { data: goals, error: gErr } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", u.id)
          .eq("status", "active")
          .eq("frequency", "daily");

        if (gErr || !goals || goals.length === 0) {
          continue;
        }

        // Aggregate hourly logs to find peak coding hour
        const { data: logs } = await supabase
          .from("wakatime_logs")
          .select("hourly")
          .eq("user_id", u.id)
          .limit(14); // Look at last 14 logs for historical window

        const hourSums = Array(24).fill(0);
        let hasLogs = false;
        if (logs) {
          for (const log of logs) {
            if (Array.isArray(log.hourly)) {
              hasLogs = true;
              log.hourly.forEach((val: number, idx: number) => {
                hourSums[idx] += val;
              });
            }
          }
        }

        // Find argmax hour (peak window)
        let peakHour = 20; // Default to 8 PM local
        if (hasLogs) {
          let maxVal = -1;
          for (let h = 0; h < 24; h++) {
            if (hourSums[h] > maxVal) {
              maxVal = hourSums[h];
              peakHour = h;
            }
          }
        }

        // Get current hour in user's timezone
        const userTz = u.timezone || "UTC";
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: userTz,
          hour: "numeric",
          hour12: false,
        });
        const currentHour = parseInt(formatter.format(new Date()), 10) % 24;

        // Check if we are approaching the peak hour (1 hour prior or in the peak hour itself)
        const isApproachingPeak = currentHour === peakHour || currentHour === (peakHour - 1 + 24) % 24;

        if (!isApproachingPeak) {
          continue;
        }

        // Process goals
        for (const g of goals) {
          // Check if already sent today
          const { data: sent } = await supabase
            .from("reminders_sent")
            .select("id")
            .eq("goal_id", g.id)
            .eq("sent_date", todayStr)
            .maybeSingle();

          if (sent) continue;

          // Format progress & target durations nicely
          const formatHours = (seconds: number) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            if (h === 0) return `${m}m`;
            return `${h}h ${m}m`;
          };

          const progressStr = formatHours(g.progress_seconds);
          const targetStr = formatHours(g.duration_seconds_target);

          // Simulation or actual Resend call
          const toAddress = u.email;
          if (!toAddress) continue;

          const emailSubject = "🔥 Keep the streak alive: Your peak coding hours are here!";
          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    background-color: #f7f7f4;
                    color: #26251e;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    margin: 0;
                    padding: 40px 20px;
                  }
                  .card {
                    background-color: #ffffff;
                    border: 1px solid #e6e5e0;
                    border-radius: 8px;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 32px;
                  }
                  .eyebrow {
                    color: #f54e00;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.88px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                  }
                  h1 {
                    font-size: 24px;
                    font-weight: 400;
                    letter-spacing: -0.32px;
                    margin: 0 0 16px 0;
                  }
                  p {
                    font-size: 15px;
                    line-height: 1.5;
                    color: #5a5852;
                    margin: 0 0 24px 0;
                  }
                  .goal-box {
                    border-left: 2px solid #f54e00;
                    background-color: #fafaf7;
                    padding: 16px;
                    margin-bottom: 24px;
                  }
                  .goal-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 4px;
                  }
                  .goal-progress {
                    font-size: 13px;
                    color: #807d72;
                  }
                  .btn {
                    display: inline-block;
                    background-color: #f54e00;
                    color: #ffffff !important;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 14px;
                    padding: 10px 20px;
                    border-radius: 6px;
                    text-align: center;
                  }
                  .footer {
                    margin-top: 32px;
                    font-size: 12px;
                    color: #807d72;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="eyebrow">Peak Coding Window</div>
                  <h1>Your window is open, ${u.display_name}</h1>
                  <p>
                    Historically, you do some of your best coding work around this time. You still have an active daily goal waiting for you:
                  </p>
                  <div class="goal-box">
                    <div class="goal-title">${g.title}</div>
                    <div class="goal-progress">Progress today: <strong>${progressStr}</strong> / ${targetStr}</div>
                  </div>
                  <p>
                    Open your IDE and crush it to secure your <strong>${u.current_streak} day streak</strong>!
                  </p>
                  <a href="${siteUrl}/dashboard" class="btn">Jump to CodePulse</a>
                  <div class="footer">
                    Sent automatically by CodePulse accountability triggers. You can disable these in Settings.
                  </div>
                </div>
              </body>
            </html>
          `;

          if (resendApiKey) {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: resendFrom,
                to: [toAddress],
                subject: emailSubject,
                html: emailHtml,
              }),
            });

            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Resend returned status ${res.status}: ${errBody}`);
            }
          } else {
            console.log(`[Smart Reminders Simulation] Would send email to ${toAddress}:
              Subject: ${emailSubject}
              Goal: ${g.title} (${progressStr} / ${targetStr})
              Current streak: ${u.current_streak}d`);
          }

          // Insert into reminders_sent
          const { error: insErr } = await supabase.from("reminders_sent").insert({
            user_id: u.id,
            goal_id: g.id,
            sent_date: todayStr,
          });

          if (insErr) throw insErr;
          results.push({ userId: u.id, goalId: g.id, sent: true });
        }
      } catch (err: any) {
        results.push({ userId: u.id, error: err.message || err });
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

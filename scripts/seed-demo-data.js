const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 [1/8] Reading environment from .env.local...");

  const envPath = path.join(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ Error: Missing .env.local file. Please run copy-env or create it first.");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const getEnvVar = (key) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
    return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : null;
  };

  const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.\n" +
        "Please retrieve the service_role key from your Supabase Dashboard and add it."
    );
    process.exit(1);
  }

  // Set up standard headers for API calls using service_role bypass
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  console.log("🎯 [2/8] Identifying target profile...");

  // Find the most recently active or created profile in the database
  const profilesRes = await fetch(`${supabaseUrl}/rest/v1/profiles?order=updated_at.desc&limit=1`, { headers });
  if (!profilesRes.ok) {
    const errText = await profilesRes.text();
    throw new Error(`Failed to fetch profiles: ${errText}`);
  }
  const profilesList = await profilesRes.json();
  if (profilesList.length === 0) {
    console.error("❌ Error: No profiles found in the database. Please sign up an account first.");
    process.exit(1);
  }

  const targetUser = profilesList[0];
  console.log(`👤 Target User: ${targetUser.display_name} (${targetUser.id})`);

  let groupId = targetUser.group_id;

  // If target user doesn't have a group, let's create a beautiful default one!
  if (!groupId) {
    console.log("⚡ User is not in a group. Provisioning a premium Ghanaian demo group...");
    const groupRes = await fetch(`${supabaseUrl}/rest/v1/groups`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Ashesi Tech Pioneers",
        join_code: "CP-GH99",
        admin_id: targetUser.id,
        is_arena_public: true,
      }),
    });

    if (!groupRes.ok) {
      const errText = await groupRes.text();
      throw new Error(`Failed to create demo group: ${errText}`);
    }

    const newGroups = await groupRes.json();
    groupId = newGroups[0].id;
    console.log(`🏢 Created Group: "Ashesi Tech Pioneers" (Join Code: CP-GH99)`);

    // Assign target user to group
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUser.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ group_id: groupId, onboarded: true, wakatime_connected: true }),
    });
  }

  console.log(`🏢 Target Group ID: ${groupId}`);

  console.log("🧹 [3/8] Cleaning up existing mock teammates to prevent duplicates...");

  const mockEmails = ["kwame@codepulse.dev", "ama@codepulse.dev", "kofi@codepulse.dev", "abena@codepulse.dev"];

  // Find existing auth users with these emails
  // Since we can't search auth users directly via standard REST, we fetch by email in profiles
  const existingProfilesRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?email=in.(${mockEmails.map((e) => `"${e}"`).join(",")})`,
    { headers }
  );
  if (existingProfilesRes.ok) {
    const existingProfiles = await existingProfilesRes.json();
    for (const p of existingProfiles) {
      console.log(`🗑️ Deleting user ${p.display_name} (${p.id})...`);
      // Delete from auth admin endpoint
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${p.id}`, {
        method: "DELETE",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });
    }
  }

  console.log("🚀 [4/8] Creating 4 Ghanaian developer teammates...");

  const teammatesData = [
    {
      email: "kwame@codepulse.dev",
      display_name: "Kwame Mensah",
      timezone: "Africa/Accra",
      current_streak: 8,
      longest_streak: 15,
      languages: ["TypeScript", "CSS", "HTML"],
      projects: ["Pulse Dashboard", "Stitch Compiler"],
      peakHour: 15, // 3 PM peak
      streakBadge: "streak_7",
    },
    {
      email: "ama@codepulse.dev",
      display_name: "Ama Osei",
      timezone: "Africa/Accra",
      current_streak: 12,
      longest_streak: 22,
      languages: ["Python", "SQL", "Shell"],
      projects: ["LLM Agent Pipeline", "Analytical Model"],
      peakHour: 11, // 11 AM peak
      streakBadge: "streak_7",
    },
    {
      email: "kofi@codepulse.dev",
      display_name: "Kofi Boateng",
      timezone: "Africa/Accra",
      current_streak: 5,
      longest_streak: 9,
      languages: ["Go", "Rust", "YAML"],
      projects: ["High Perf Proxy", "WebAssembly Engine"],
      peakHour: 23, // 11 PM Night Owl
      streakBadge: "first_commit",
    },
    {
      email: "abena@codepulse.dev",
      display_name: "Abena Akoto",
      timezone: "Africa/Accra",
      current_streak: 4,
      longest_streak: 6,
      languages: ["CSS", "TypeScript", "HTML"],
      projects: ["Design System", "Editorial Canvas"],
      peakHour: 6, // 6 AM Early Bird
      streakBadge: "first_commit",
    },
  ];

  const teammates = [];

  for (const t of teammatesData) {
    // Create actual user via Auth Admin API
    const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: t.email,
        password: "demopassword123",
        email_confirm: true,
        user_metadata: {
          display_name: t.display_name,
        },
      }),
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.warn(`⚠️ Warning: Failed to create auth user for ${t.display_name}: ${errText}`);
      continue;
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // Update their profile to join the same group and add streaks
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        group_id: groupId,
        onboarded: true,
        wakatime_connected: true,
        current_streak: t.current_streak,
        longest_streak: t.longest_streak,
        timezone: t.timezone,
      }),
    });

    teammates.push({ id: userId, ...t });
    console.log(`✅ Provisioned Teammate: ${t.display_name}`);
  }

  console.log("📅 [5/8] Generating a 14-day history of WakaTime activity logs...");

  const today = new Date();
  const logsToUpsert = [];

  // Generate logs for Ghanaian teammates
  for (const t of teammates) {
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - dayOffset);
      const dateStr = logDate.toISOString().split("T")[0];

      // Add small randomness to totals based on their developer archetype
      let durationBase = 12000; // ~3.3 hours
      if (t.display_name === "Ama Osei") durationBase = 18000; // ~5 hours (hard grinder)
      if (t.display_name === "Abena Akoto") durationBase = 8000; // ~2.2 hours

      // 15% chance to have missed a day, unless they have active streaks
      if (dayOffset > t.current_streak && Math.random() < 0.15) {
        continue;
      }

      const totalSeconds = Math.round(durationBase + (Math.random() - 0.5) * 4000);

      // Map languages
      const languages = t.languages.map((l, idx) => {
        const pct = idx === 0 ? 0.6 : idx === 1 ? 0.3 : 0.1;
        return {
          name: l,
          total_seconds: Math.round(totalSeconds * pct),
        };
      });

      // Map projects
      const projects = t.projects.map((p, idx) => {
        const pct = idx === 0 ? 0.7 : 0.3;
        return {
          name: p,
          total_seconds: Math.round(totalSeconds * pct),
        };
      });

      // Fill hourly 24-slot array focusing around their peak window
      const hourly = Array(24).fill(0);
      const peak = t.peakHour;
      const hoursToDistribute = [peak, (peak - 1 + 24) % 24, (peak + 1) % 24];

      const firstShare = Math.round(totalSeconds * 0.6);
      const secondShare = Math.round(totalSeconds * 0.3);
      const thirdShare = totalSeconds - firstShare - secondShare;

      hourly[peak] = firstShare;
      hourly[(peak - 1 + 24) % 24] = secondShare;
      hourly[(peak + 1) % 24] = thirdShare;

      logsToUpsert.push({
        user_id: t.id,
        log_date: dateStr,
        total_seconds: totalSeconds,
        top_language: t.languages[0],
        top_project: t.projects[0],
        languages: languages,
        projects: projects,
        hourly: hourly,
      });
    }
  }

  // ALSO Generate logs for the logged-in Target User (lights up their own contribution heatmap!)
  console.log(`🔥 Generating 14-day activity logs for you (${targetUser.display_name}) to light up the contribution heatmap...`);
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - dayOffset);
    const dateStr = logDate.toISOString().split("T")[0];

    // Simulating user activity
    const totalSeconds = Math.round(7200 + (Math.random() - 0.5) * 3000); // ~2 hours daily

    const languages = [
      { name: "TypeScript", total_seconds: Math.round(totalSeconds * 0.7) },
      { name: "HTML", total_seconds: Math.round(totalSeconds * 0.2) },
      { name: "CSS", total_seconds: totalSeconds - Math.round(totalSeconds * 0.9) },
    ];

    const projects = [
      { name: "CodePulse App", total_seconds: Math.round(totalSeconds * 0.8) },
      { name: "Portfolio Site", total_seconds: totalSeconds - Math.round(totalSeconds * 0.8) },
    ];

    const hourly = Array(24).fill(0);
    hourly[19] = Math.round(totalSeconds * 0.7); // Peak around 7 PM
    hourly[20] = totalSeconds - hourly[19];

    logsToUpsert.push({
      user_id: targetUser.id,
      log_date: dateStr,
      total_seconds: totalSeconds,
      top_language: "TypeScript",
      top_project: "CodePulse App",
      languages: languages,
      projects: projects,
      hourly: hourly,
    });
  }

  // Push all logs
  const logsRes = await fetch(`${supabaseUrl}/rest/v1/wakatime_logs`, {
    method: "POST",
    headers,
    body: JSON.stringify(logsToUpsert),
  });

  if (!logsRes.ok) {
    const errText = await logsRes.text();
    throw new Error(`Failed to insert activity logs: ${errText}`);
  }
  console.log(`✅ Successfully seeded ${logsToUpsert.length} total daily WakaTime logs!`);

  // Ensure Target user streaks are also looking excellent
  await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${targetUser.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      current_streak: 7,
      longest_streak: 10,
    }),
  });

  console.log("🏆 [6/8] Seeding badges for members...");

  // Fetch all seeded catalog badges to obtain their IDs
  const badgesRes = await fetch(`${supabaseUrl}/rest/v1/badges`, { headers });
  if (badgesRes.ok) {
    const badges = await badgesRes.json();
    const userBadgesToInsert = [];

    // Map helper
    const getBadgeId = (slug) => badges.find((b) => b.slug === slug)?.id;

    // Kwame Badges
    if (getBadgeId("streak_7")) userBadgesToInsert.push({ user_id: teammates[0].id, badge_id: getBadgeId("streak_7") });
    if (getBadgeId("centurion")) userBadgesToInsert.push({ user_id: teammates[0].id, badge_id: getBadgeId("centurion") });
    if (getBadgeId("deep_work")) userBadgesToInsert.push({ user_id: teammates[0].id, badge_id: getBadgeId("deep_work") });

    // Ama Badges
    if (getBadgeId("streak_7")) userBadgesToInsert.push({ user_id: teammates[1].id, badge_id: getBadgeId("streak_7") });
    if (getBadgeId("goal_crusher")) userBadgesToInsert.push({ user_id: teammates[1].id, badge_id: getBadgeId("goal_crusher") });
    if (getBadgeId("deep_work")) userBadgesToInsert.push({ user_id: teammates[1].id, badge_id: getBadgeId("deep_work") });

    // Kofi Badges
    if (getBadgeId("night_owl")) userBadgesToInsert.push({ user_id: teammates[2].id, badge_id: getBadgeId("night_owl") });
    if (getBadgeId("polyglot")) userBadgesToInsert.push({ user_id: teammates[2].id, badge_id: getBadgeId("polyglot") });

    // Abena Badges
    if (getBadgeId("early_bird")) userBadgesToInsert.push({ user_id: teammates[3].id, badge_id: getBadgeId("early_bird") });
    if (getBadgeId("first_commit")) userBadgesToInsert.push({ user_id: teammates[3].id, badge_id: getBadgeId("first_commit") });

    // Target User Badges
    if (getBadgeId("first_commit")) userBadgesToInsert.push({ user_id: targetUser.id, badge_id: getBadgeId("first_commit") });
    if (getBadgeId("streak_7")) userBadgesToInsert.push({ user_id: targetUser.id, badge_id: getBadgeId("streak_7") });

    // Delete existing user badges for these users
    const allUserIds = [targetUser.id, ...teammates.map((t) => t.id)];
    await fetch(`${supabaseUrl}/rest/v1/user_badges?user_id=in.(${allUserIds.map((id) => `"${id}"`).join(",")})`, {
      method: "DELETE",
      headers,
    });

    // Insert user badges
    const validUserBadges = userBadgesToInsert.filter((ub) => ub.badge_id !== undefined);
    if (validUserBadges.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/user_badges`, {
        method: "POST",
        headers,
        body: JSON.stringify(validUserBadges),
      });
      console.log(`✅ Earned badges seeded for all users!`);
    }
  }

  console.log("🎯 [7/8] Seeding accountability goals for you...");

  // Delete existing goals for target user
  await fetch(`${supabaseUrl}/rest/v1/goals?user_id=eq.${targetUser.id}`, {
    method: "DELETE",
    headers,
  });

  // Insert 3 beautiful demo goals
  const goalsToInsert = [
    {
      user_id: targetUser.id,
      title: "Grind 50 LeetCode Problems",
      language: "TypeScript",
      duration_seconds_target: 3600, // 1 hour
      frequency: "daily",
      status: "active",
      progress_seconds: 2400, // 40 minutes done today
    },
    {
      user_id: targetUser.id,
      title: "Complete React 19 Editorial Form UI",
      language: "TypeScript",
      duration_seconds_target: 7200, // 2 hours
      frequency: "daily",
      status: "completed",
      progress_seconds: 7200,
      completed_at: new Date().toISOString(),
    },
    {
      user_id: targetUser.id,
      title: "Write Supabase Edge Function Sync Triggers",
      language: "TypeScript",
      duration_seconds_target: 14400, // 4 hours
      frequency: "weekly",
      status: "completed",
      progress_seconds: 18000,
      completed_at: new Date().toISOString(),
    },
  ];

  await fetch(`${supabaseUrl}/rest/v1/goals`, {
    method: "POST",
    headers,
    body: JSON.stringify(goalsToInsert),
  });
  console.log(`✅ Demo goals created!`);

  console.log("✨ [8/8] Seeding group interactions (nudges & kudos)...");

  // Delete existing interactions in this group
  await fetch(`${supabaseUrl}/rest/v1/interactions?group_id=eq.${groupId}`, {
    method: "DELETE",
    headers,
  });

  const interactionsToInsert = [
    {
      sender_id: teammates[0].id, // Kwame
      recipient_id: targetUser.id,
      group_id: groupId,
      type: "kudo",
      message: "Akwaaba! Outstanding progress on the settings-client component! Clean borders and typography match DESIGN.md beautifully.",
    },
    {
      sender_id: teammates[1].id, // Ama
      recipient_id: targetUser.id,
      group_id: groupId,
      type: "kudo",
      message: "You've been grinding hard on TypeScript! Solid effort, keep that streak on fire! 🔥",
    },
    {
      sender_id: teammates[2].id, // Kofi
      recipient_id: targetUser.id,
      group_id: groupId,
      type: "nudge",
      message: "Your typical evening coding peak hour is starting soon! Don't forget to push a commit to hit your daily goal!",
    },
  ];

  await fetch(`${supabaseUrl}/rest/v1/interactions`, {
    method: "POST",
    headers,
    body: JSON.stringify(interactionsToInsert),
  });
  console.log("✅ Demo interactions loaded!");

  console.log("\n🎉 ========================================================");
  console.log("🔥 DEMO DATA SEEDING COMPLETE FOR CODEPULSE!");
  console.log(`🏢 Group Name: "Ashesi Tech Pioneers"`);
  console.log(`🔑 Join Code: "CP-GH99"`);
  console.log(`👥 Teammates Added: Kwame Mensah, Ama Osei, Kofi Boateng, Abena Akoto`);
  console.log(`📈 Logs Created: 14 days of historical data for all members.`);
  console.log(`📊 Heatmap and charts will display full analytics immediately.`);
  console.log("======================================================== 🎉\n");
}

main().catch((err) => {
  console.error("❌ Seeding failed with error:", err);
  process.exit(1);
});

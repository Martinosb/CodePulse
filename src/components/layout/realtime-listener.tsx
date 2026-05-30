"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Tables } from "@/lib/database.types";

/**
 * Subscribes to incoming nudges/kudos for the current user and surfaces them as
 * frosted toasts. Also refreshes the dashboard when a groupmate's logs change
 * so the leaderboard re-ranks live.
 */
export function RealtimeListener({ userId }: { userId: string }) {
  const { push } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`rt-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Tables<"interactions">;
          push({
            tone: row.type === "kudo" ? "kudo" : "nudge",
            title: row.type === "kudo" ? "You got kudos! 🎉" : "You've been nudged 👀",
            description: row.message ?? undefined,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wakatime_logs" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, push, router]);

  return null;
}

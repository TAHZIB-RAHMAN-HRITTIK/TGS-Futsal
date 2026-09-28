"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

/**
 * Drop this anywhere in a page. It listens for changes on `matches` and
 * `match_stats` and triggers a server-component refresh, so standings,
 * fixtures, results and player stats update live on every open tab
 * without anyone hitting reload.
 */
export default function LiveRefresher() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabaseBrowser
      .channel("live-tournament")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_stats" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [router]);

  return null;
}

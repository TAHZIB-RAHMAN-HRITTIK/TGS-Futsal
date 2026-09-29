"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "./supabase";
import { getMatches } from "./data";
import type { MatchStatus } from "./types";

const COOKIE_NAME = "tgs_admin";
const num = (f: FormData, k: string) =>
  Math.max(0, parseInt(String(f.get(k) ?? "0")) || 0);

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  if (password !== process.env.ADMIN_PASSWORD) redirect("/admin?error=1");
  cookies().set(COOKIE_NAME, process.env.ADMIN_PASSWORD!, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  cookies().delete(COOKIE_NAME);
  redirect("/admin");
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  await supabaseAdmin().from("matches").update({ status }).eq("id", matchId);
  revalidatePath("/", "layout");
}

export async function saveAllMatchData(matchId: string, formData: FormData) {
  const sb = supabaseAdmin();

  const homeScore = num(formData, "home_score");
  const awayScore = num(formData, "away_score");
  const motmRaw   = formData.get("motm_player_id");
  const motmId    = motmRaw && motmRaw !== "" ? String(motmRaw) : null;

  // Was the match live? → auto-complete after saving
  const { data: cur } = await sb
    .from("matches").select("status").eq("id", matchId).single();
  const wasLive = cur?.status === "live";

  // Were stats already entered? → "updated" vs "saved"
  const { count: existingCount } = await sb
    .from("match_stats")
    .select("*", { count: "exact", head: true })
    .eq("match_id", matchId);
  const isUpdate = (existingCount ?? 0) > 0;

  // Save score + MOTM (+ auto-complete if match was live)
  const { error: mErr } = await sb.from("matches").update({
    home_score: homeScore,
    away_score: awayScore,
    motm_player_id: motmId,
    ...(wasLive ? { status: "completed" } : {}),
  }).eq("id", matchId);
  if (mErr) throw mErr;

  // GK ids — needed for auto clean sheet
  const homeGkId = String(formData.get("home_gk_id") ?? "").trim();
  const awayGkId = String(formData.get("away_gk_id") ?? "").trim();

  // Auto clean sheet: GK keeps clean sheet if the OPPOSING team scored 0
  //   home GK → clean sheet when away_score === 0
  //   away GK → clean sheet when home_score === 0
  const homeGkCs = awayScore === 0 && homeGkId !== "";
  const awayGkCs = homeScore === 0 && awayGkId !== "";

  const playerIds = formData.getAll("player_ids") as string[];
  const stats = playerIds.map((pid) => ({
    match_id: matchId,
    player_id: pid,
    goals:         num(formData, `${pid}_goals`),
    assists:       num(formData, `${pid}_assists`),
    through_cross: num(formData, `${pid}_through_cross`),
    tackles_won:   num(formData, `${pid}_tackles_won`),
    interceptions: num(formData, `${pid}_interceptions`),
    saves:         num(formData, `${pid}_saves`),
    fouls:         num(formData, `${pid}_fouls`),
    yellow_cards:  num(formData, `${pid}_yellow_cards`),
    red_cards:     num(formData, `${pid}_red_cards`),
    clean_sheet:
      pid === homeGkId ? homeGkCs :
      pid === awayGkId ? awayGkCs : false,
  }));

  if (stats.length > 0) {
    const { error } = await sb
      .from("match_stats")
      .upsert(stats, { onConflict: "match_id,player_id" });
    if (error) throw error;
  }

  revalidatePath("/", "layout");

  const flag = wasLive ? "done" : isUpdate ? "updated" : "new";
  redirect(`/admin/dashboard/match/${matchId}?saved=${flag}`);
}

export async function generateKnockouts() {
  const sb = supabaseAdmin();
  const allMatches = await getMatches();
  const { data: raw } = await sb
    .from("matches").select("id, home_team_id, away_team_id")
    .in("stage", ["semi", "final"]);
  const rawById = Object.fromEntries((raw ?? []).map((r) => [r.id, r]));

  for (const m of allMatches.filter(m => m.stage === "semi" || m.stage === "final")) {
    const r = rawById[m.id];
    if (!r) continue;
    const upd: { home_team_id?: string; away_team_id?: string } = {};
    if (!r.home_team_id && m.home_team?.id) upd.home_team_id = m.home_team.id;
    if (!r.away_team_id && m.away_team?.id) upd.away_team_id = m.away_team.id;
    if (Object.keys(upd).length > 0)
      await sb.from("matches").update(upd).eq("id", m.id);
  }

  revalidatePath("/", "layout");
  redirect("/admin/dashboard?kgen=1");
}

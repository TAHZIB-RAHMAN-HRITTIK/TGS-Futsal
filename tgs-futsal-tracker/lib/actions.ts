"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "./supabase";
import type { MatchStatus } from "./types";

const COOKIE_NAME = "tgs_admin";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }
  cookies().set(COOKIE_NAME, process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days — covers tournament day plus buffer
  });
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  cookies().delete(COOKIE_NAME);
  redirect("/admin");
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("matches").update({ status }).eq("id", matchId);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore })
    .eq("id", matchId);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function setMotm(matchId: string, playerId: string | null) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("matches")
    .update({ motm_player_id: playerId })
    .eq("id", matchId);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export interface StatInput {
  goals: number;
  assists: number;
  through_cross: number;
  tackles_won: number;
  interceptions: number;
  saves: number;
  fouls: number;
  yellow_cards: number;
  red_cards: number;
  clean_sheet: boolean;
}

export async function upsertMatchStat(
  matchId: string,
  playerId: string,
  stat: StatInput
) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("match_stats")
    .upsert(
      { match_id: matchId, player_id: playerId, ...stat },
      { onConflict: "match_id,player_id" }
    );
  if (error) throw error;
  revalidatePath("/", "layout");
}

const numField = (formData: FormData, name: string) =>
  Number(formData.get(name) ?? 0) || 0;

/** Parses a per-player stat entry form and saves it. Bind matchId/playerId
 *  from the <form action={saveStatFromForm.bind(null, matchId, playerId)}>. */
export async function saveStatFromForm(
  matchId: string,
  playerId: string,
  formData: FormData
) {
  await upsertMatchStat(matchId, playerId, {
    goals: numField(formData, "goals"),
    assists: numField(formData, "assists"),
    through_cross: numField(formData, "through_cross"),
    tackles_won: numField(formData, "tackles_won"),
    interceptions: numField(formData, "interceptions"),
    saves: numField(formData, "saves"),
    fouls: numField(formData, "fouls"),
    yellow_cards: numField(formData, "yellow_cards"),
    red_cards: numField(formData, "red_cards"),
    clean_sheet: formData.get("clean_sheet") === "on",
  });
}

export async function saveScoreFromForm(matchId: string, formData: FormData) {
  await updateMatchScore(
    matchId,
    numField(formData, "home_score"),
    numField(formData, "away_score")
  );
}

export async function saveMotmFromForm(matchId: string, formData: FormData) {
  const playerId = formData.get("motm_player_id");
  await setMotm(matchId, playerId && playerId !== "" ? String(playerId) : null);
}

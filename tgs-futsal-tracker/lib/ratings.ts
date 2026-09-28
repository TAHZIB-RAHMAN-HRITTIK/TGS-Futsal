import type { MatchStat } from "./types";

/**
 * Match rating formula:
 * 6 (base)
 * + 0.5 per goal
 * + 0.25 per assist
 * - 0.5 per yellow card
 * - 2 per red card
 * + 2 if Man of the Match
 * + 0.1 per tackle won
 * + 0.1 per interception
 * + 0.25 per save
 * Clamped so it never exceeds 10 (floored at 0, since a negative rating
 * isn't meaningful for display).
 */
export function calculateRating(
  stat: Pick<
    MatchStat,
    | "goals"
    | "assists"
    | "yellow_cards"
    | "red_cards"
    | "tackles_won"
    | "interceptions"
    | "saves"
  >,
  isMotm: boolean
): number {
  let rating = 6;
  rating += stat.goals * 0.5;
  rating += stat.assists * 0.25;
  rating -= stat.yellow_cards * 0.5;
  rating -= stat.red_cards * 2;
  if (isMotm) rating += 2;
  rating += stat.tackles_won * 0.1;
  rating += stat.interceptions * 0.1;
  rating += stat.saves * 0.25;

  rating = Math.max(0, Math.min(10, rating));
  return Math.round(rating * 10) / 10;
}

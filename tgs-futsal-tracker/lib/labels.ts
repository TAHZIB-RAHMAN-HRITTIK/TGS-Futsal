import type { Match } from "./types";

/** Team name, or the placeholder label (e.g. "Group A 1st") while TBD. */
export const homeName = (m: Match) => m.home_team?.name ?? m.home_label ?? "TBD";
export const awayName = (m: Match) => m.away_team?.name ?? m.away_label ?? "TBD";

export function stageLabel(m: Match) {
  if (m.stage === "group") return `Group ${m.group_name}`;
  return m.stage === "semi" ? "Semi-Final" : "Final";
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchById, getPlayers } from "@/lib/data";
import { saveAllMatchData, updateMatchStatus } from "@/lib/actions";
import { homeName, awayName, stageLabel } from "@/lib/labels";
import SavedBanner from "@/components/SavedBanner";
import type { Player, MatchStat } from "@/lib/types";

export const revalidate = 0;

const STATS = [
  { key: "goals",         label: "G"   },
  { key: "assists",       label: "A"   },
  { key: "through_cross", label: "T/C" },
  { key: "tackles_won",   label: "TW"  },
  { key: "interceptions", label: "INT" },
  { key: "saves",         label: "SV"  },
  { key: "fouls",         label: "FL"  },
  { key: "yellow_cards",  label: "YC"  },
  { key: "red_cards",     label: "RC"  },
] as const;
type StatKey = (typeof STATS)[number]["key"];

const TIPS: [string, string][] = [
  ["G",   "Goal"],
  ["A",   "Assist"],
  ["T/C", "Through Ball / Cross"],
  ["TW",  "Tackle Won"],
  ["INT", "Interception"],
  ["SV",  "Save (GK)"],
  ["FL",  "Foul committed"],
  ["YC",  "Yellow Card"],
  ["RC",  "Red Card"],
];

function val(stat: MatchStat | undefined, key: StatKey): number {
  return stat ? ((stat[key as keyof MatchStat] as number) ?? 0) : 0;
}

const BANNER: Record<string, string> = {
  new:     "✓  Stats saved",
  updated: "✓  Stats updated",
  done:    "✓  Stats saved — match marked Completed",
};

export default async function AdminMatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string>;
}) {
  const data = await getMatchById(params.id);
  if (!data) notFound();
  const { match, stats } = data;

  const [homePlayers, awayPlayers] = await Promise.all([
    match.home_team_id ? getPlayers(match.home_team_id) : Promise.resolve<Player[]>([]),
    match.away_team_id ? getPlayers(match.away_team_id) : Promise.resolve<Player[]>([]),
  ]);
  const allPlayers  = [...homePlayers, ...awayPlayers];
  const statById    = Object.fromEntries(stats.map((s) => [s.player_id, s]));

  // Default GK: whoever has clean_sheet=true in saved stats, else kit_no=1
  const findGk = (players: Player[]) =>
    players.find((p) => statById[p.id]?.clean_sheet === true) ??
    players.find((p) => p.kit_no === 1);

  const homeDefaultGkId = findGk(homePlayers)?.id ?? "";
  const awayDefaultGkId = findGk(awayPlayers)?.id ?? "";

  const bannerMsg = BANNER[searchParams.saved ?? ""] ?? "";

  return (
    <div className="space-y-6 pb-24">
      <SavedBanner show={!!bannerMsg} message={bannerMsg} />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/dashboard" className="text-sm text-turf hover:underline">← Dashboard</Link>
        <div>
          <h1 className="font-display text-xl text-ink">
            {homeName(match)} vs {awayName(match)}
          </h1>
          <p className="text-xs text-[#5B6B62]">{stageLabel(match)}</p>
        </div>
      </div>

      {/* Status — one-click, outside main form */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[#5B6B62] uppercase tracking-wide">Status:</span>
        {(["upcoming", "live", "completed"] as const).map((status) => (
          <form key={status} action={updateMatchStatus.bind(null, match.id, status)}>
            <button
              type="submit"
              className={`px-3 py-1 text-xs border transition-colors ${
                match.status === status
                  ? "bg-pitch text-bone border-pitch font-semibold"
                  : "border-[#D6E3EC] hover:border-pitch"
              }`}
            >
              {status === "live" ? "🔴 Live" : status === "upcoming" ? "⬜ Upcoming" : "✓ Completed"}
            </button>
          </form>
        ))}
        {match.status === "live" && (
          <span className="text-xs text-[#5B6B62] italic">
            (Saving will auto-complete this match)
          </span>
        )}
      </div>

      {/* ── MAIN FORM ── */}
      <form action={saveAllMatchData.bind(null, match.id)} className="space-y-6">

        {/* Score + MOTM */}
        <div className="bg-card p-5 flex flex-wrap items-end gap-6">
          <div className="flex items-end gap-3">
            <label className="text-sm font-medium">
              <span className="text-[#2C84B6]">{homeName(match)}</span>
              <input
                type="number" name="home_score" min={0} defaultValue={match.home_score}
                className="block w-16 border border-[#D6E3EC] text-center px-2 py-1.5 mt-1 font-display text-2xl"
              />
            </label>
            <span className="font-display text-3xl pb-1.5 text-[#5B6B62]">–</span>
            <label className="text-sm font-medium">
              <span className="text-[#8A6500]">{awayName(match)}</span>
              <input
                type="number" name="away_score" min={0} defaultValue={match.away_score}
                className="block w-16 border border-[#D6E3EC] text-center px-2 py-1.5 mt-1 font-display text-2xl"
              />
            </label>
          </div>
          <div className="text-xs text-[#5B6B62] italic self-end pb-0.5">
            Clean sheet is awarded automatically<br />to the GK if the opponent scores 0.
          </div>
          <label className="text-sm font-medium">
            Man of the Match ⭐
            <select
              name="motm_player_id" defaultValue={match.motm_player_id ?? ""}
              className="block border border-[#D6E3EC] px-2 py-1.5 mt-1 min-w-[14rem] text-sm bg-white"
            >
              <option value="">— None —</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Stat key */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs border border-[#D6E3EC] bg-white px-3 py-2.5">
          <span className="font-semibold text-ink mr-1">Key →</span>
          {TIPS.map(([abbr, full]) => (
            <span key={abbr} className="text-[#5B6B62]">
              <span className="font-semibold text-ink">{abbr}</span> = {full}
            </span>
          ))}
        </div>

        {/* HOME team — sky blue */}
        <TeamSection
          title={homeName(match)} side="HOME" colorScheme="home"
          players={homePlayers} statById={statById}
          defaultGkId={homeDefaultGkId} gkSelectName="home_gk_id"
        />

        {/* AWAY team — amber */}
        <TeamSection
          title={awayName(match)} side="AWAY" colorScheme="away"
          players={awayPlayers} statById={statById}
          defaultGkId={awayDefaultGkId} gkSelectName="away_gk_id"
        />

        {/* Sticky Save button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D6E3EC] px-4 py-3 flex justify-end z-40">
          <button
            type="submit"
            className="bg-pitch text-bone px-10 py-3 font-semibold text-sm hover:bg-pitch-dark transition-colors"
          >
            💾  Save All Data
          </button>
        </div>
      </form>
    </div>
  );
}

function TeamSection({
  title, side, players, statById, defaultGkId, gkSelectName, colorScheme,
}: {
  title: string;
  side: "HOME" | "AWAY";
  players: Player[];
  statById: Record<string, MatchStat>;
  defaultGkId: string;
  gkSelectName: string;
  colorScheme: "home" | "away";
}) {
  if (players.length === 0) return null;

  const isHome = colorScheme === "home";
  const borderColor = isHome ? "border-[#2C84B6]" : "border-[#F2B705]";
  const bgColor     = isHome ? "bg-[#EEF5FA]"     : "bg-[#FFF8E7]";
  const badgeBg     = isHome ? "bg-[#2C84B6] text-white" : "bg-[#F2B705] text-[#0E2A3F]";
  const headColor   = isHome ? "text-[#2C84B6]"   : "text-[#8A6500]";

  return (
    <section className={`border-l-4 ${borderColor} ${bgColor} p-4 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 ${badgeBg}`}>{side}</span>
          <h2 className={`font-display text-lg ${headColor}`}>{title}</h2>
        </div>
        {/* GK picker — tells the system who gets auto clean sheet */}
        <label className="flex items-center gap-2 text-sm font-medium">
          🧤 Goalkeeper:
          <select
            name={gkSelectName} defaultValue={defaultGkId}
            className="border border-[#D6E3EC] bg-white px-2 py-1 text-sm"
          >
            <option value="">— Select GK —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm bg-white">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="text-left font-semibold text-[#5B6B62] text-xs py-2 pr-4 pl-2 whitespace-nowrap">
                Player
              </th>
              {STATS.map((s) => (
                <th key={s.key} className="text-[#5B6B62] text-xs py-2 px-1 w-10 text-center font-semibold">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-b border-[#D6E3EC] hover:bg-card">
                <input type="hidden" name="player_ids" value={p.id} />
                <td className="py-1.5 pr-4 pl-2 font-medium whitespace-nowrap">{p.name}</td>
                {STATS.map((s) => (
                  <td key={s.key} className="px-0.5 py-1">
                    <input
                      type="number"
                      name={`${p.id}_${s.key}`}
                      min={0}
                      defaultValue={val(statById[p.id], s.key)}
                      className="w-10 border border-[#D6E3EC] text-center px-0.5 py-1 text-sm focus:border-turf focus:outline-none bg-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

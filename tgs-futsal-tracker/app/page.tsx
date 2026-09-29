import Link from "next/link";
import { getMatches, getPlayerLeaderboard, type PlayerLeaderboardRow } from "@/lib/data";
import { homeName, awayName } from "@/lib/labels";
import StatusBadge from "@/components/StatusBadge";
import LiveRefresher from "@/components/LiveRefresher";
import Confetti from "@/components/Confetti";

export const revalidate = 0;

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HomePage() {
  const matches = await getMatches();

  // ── Winner detection ────────────────────────────────────────────────────
  const finalMatch = matches.find(
    (m) => m.stage === "final" && m.status === "completed"
  );
  let winner: typeof finalMatch extends undefined ? null : (typeof finalMatch extends infer M ? (M extends { home_team?: infer T } ? T | null : null) : null) = null as any;
  let topScorers: PlayerLeaderboardRow[] = [];

  if (finalMatch) {
    if (finalMatch.home_score > finalMatch.away_score) winner = finalMatch.home_team ?? null;
    else if (finalMatch.away_score > finalMatch.home_score) winner = finalMatch.away_team ?? null;

    const lb = await getPlayerLeaderboard();
    const withGoals = lb.filter((r) => r.goals > 0).sort((a, b) => b.goals - a.goals);
    const best = withGoals[0]?.goals ?? 0;
    topScorers = best > 0 ? withGoals.filter((r) => r.goals === best) : [];
  }

  // ── Live / next / recent ────────────────────────────────────────────────
  const live      = matches.find((m) => m.status === "live");
  const nextMatch = matches
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())[0];
  const featured  = live ?? nextMatch;
  const recent    = matches
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime())[0];

  return (
    <div className="space-y-10">
      <LiveRefresher />

      {/* ── WINNER BANNER (shows only after FINAL is completed) ── */}
      {finalMatch && (
        <>
          {winner && <Confetti />}
          <section className="text-center py-10 px-6 border-4 border-amber"
            style={{ background: "linear-gradient(135deg, #EEF5FA 0%, #FFF8E7 50%, #EEF5FA 100%)" }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-turf mb-3">
              🏆 Gregorian Abdur Rahim Memorial Futsal Tournament 2026
            </p>

            {winner ? (
              <>
                <h2
                  className="font-display text-5xl sm:text-7xl leading-tight mb-2"
                  style={{
                    background: "linear-gradient(135deg, #2C84B6 0%, #F2B705 60%, #2C84B6 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  {(winner as { name: string }).name}
                </h2>
                <p className="font-display text-3xl tracking-[0.15em] text-amber mb-3">
                  🥇 CHAMPIONS 🥇
                </p>
              </>
            ) : (
              <p className="font-display text-3xl text-ink mb-3">Final — Result Pending</p>
            )}

            <p className="text-[#5B6B62] text-sm">
              {homeName(finalMatch)}{" "}
              <span className="font-display text-xl text-ink tabular-nums">
                {finalMatch.home_score} – {finalMatch.away_score}
              </span>{" "}
              {awayName(finalMatch)}
            </p>

            {topScorers.length > 0 && (
              <div className="mt-6 border-t border-[#D6E3EC] pt-5">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#5B6B62] mb-2">
                  ⚽ Top Scorer{topScorers.length > 1 ? "s" : ""}
                </p>
                {topScorers.map((s) => (
                  <div key={s.player.id}>
                    <p className="font-display text-2xl text-ink">{s.player.name}</p>
                    <p className="text-sm text-[#5B6B62]">
                      {s.goals} goal{s.goals !== 1 ? "s" : ""} · {s.team?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Hero ── */}
      {!finalMatch && (
        <section className="border-b border-[#D6E3EC] pb-8">
          <p className="font-display text-turf text-sm tracking-tight mb-1">
            Dbox Sports Complex · October 2, 2026
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-ink">
            Gregorian Abdur Rahim Memorial Futsal Tournament
          </h1>
          <p className="mt-3 max-w-xl text-[#3E4A43]">
            12 teams, two groups, one cup — run by The Gregorian Society in memory
            of Gregorian Abdur Rahim. Live scores and stats update automatically as
            matches happen.
          </p>
        </section>
      )}

      {/* ── Live / next + recent result ── */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">
              {live ? "Now Playing" : "Next Match"}
            </h2>
            {featured && <StatusBadge status={featured.status} />}
          </div>
          {featured ? (
            <MatchLine match={featured} />
          ) : (
            <p className="text-sm text-[#5B6B62]">All matches complete.</p>
          )}
        </div>

        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Recent Result</h2>
            {recent && <StatusBadge status={recent.status} />}
          </div>
          {recent ? (
            <MatchLine match={recent} />
          ) : (
            <p className="text-sm text-[#5B6B62]">No matches completed yet.</p>
          )}
        </div>
      </section>

      <section className="flex flex-wrap gap-4 text-sm">
        <Link href="/standings" className="underline decoration-turf underline-offset-4">Group standings</Link>
        <Link href="/fixtures"  className="underline decoration-turf underline-offset-4">Full fixture list</Link>
        <Link href="/players"   className="underline decoration-turf underline-offset-4">Top scorers &amp; player stats</Link>
      </section>
    </div>
  );
}

function MatchLine({ match }: { match: Awaited<ReturnType<typeof getMatches>>[number] }) {
  const stage =
    match.stage === "group" ? `Group ${match.group_name}` :
    match.stage === "semi"  ? "Semi-Final" : "Final";

  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="flex items-center justify-between font-display text-2xl text-ink">
        <span>{homeName(match)}</span>
        <span className="tabular-nums px-2">
          {match.status === "upcoming"
            ? "vs"
            : `${match.home_score} – ${match.away_score}`}
        </span>
        <span className="text-right">{awayName(match)}</span>
      </div>
      <p className="mt-2 text-xs text-[#5B6B62] uppercase tracking-wide">
        {stage} · {formatKickoff(match.kickoff_at)}
      </p>
    </Link>
  );
}

import { homeName, awayName, stageLabel } from "@/lib/labels";
import Link from "next/link";
import { getMatches } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import LiveRefresher from "@/components/LiveRefresher";

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

export const revalidate = 0;

export default async function HomePage() {
  const matches = await getMatches();

  const live = matches.find((m) => m.status === "live");
  const nextUpcoming = matches
    .filter((m) => m.status === "upcoming")
    .sort(
      (a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
    )[0];
  const featured = live ?? nextUpcoming;

  const recentResult = matches
    .filter((m) => m.status === "completed")
    .sort(
      (a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
    )[0];

  return (
    <div className="space-y-10">
      <LiveRefresher />

      <section className="border-b border-[#DAD6C8] pb-8">
        <p className="font-display text-turf text-sm tracking-tight mb-1">
          Dbox Sports Complex · October 2, 2026
        </p>
        <h1 className="font-display text-3xl sm:text-4xl leading-[1.05] text-ink">
          Gregorian Abdur Rahim Memorial Futsal Tournament 2026
        </h1>
        <p className="mt-3 max-w-xl text-[#3E4A43]">
          Presented by The Gregorian Society.
        </p>
      </section>

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
            <p className="text-sm text-[#5B6B62]">Schedule not posted yet.</p>
          )}
        </div>

        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Recent Result</h2>
            {recentResult && <StatusBadge status={recentResult.status} />}
          </div>
          {recentResult ? (
            <MatchLine match={recentResult} />
          ) : (
            <p className="text-sm text-[#5B6B62]">No matches completed yet.</p>
          )}
        </div>
      </section>

      <section className="flex flex-wrap gap-4 text-sm">
        <Link href="/standings" className="underline decoration-turf underline-offset-4">
          Group standings
        </Link>
        <Link href="/fixtures" className="underline decoration-turf underline-offset-4">
          Full fixture list
        </Link>
        <Link href="/players" className="underline decoration-turf underline-offset-4">
          Top scorers &amp; player stats
        </Link>
      </section>
    </div>
  );
}

function MatchLine({ match }: { match: Awaited<ReturnType<typeof getMatches>>[number] }) {
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
        {stageLabel(match)} ·{" "}
        {formatKickoff(match.kickoff_at)}
      </p>
    </Link>
  );
}

import Link from "next/link";
import { getMatches } from "@/lib/data";
import { logoutAdmin, updateMatchStatus, generateKnockouts } from "@/lib/actions";
import { homeName, awayName, stageLabel } from "@/lib/labels";
import SavedBanner from "@/components/SavedBanner";

export const revalidate = 0;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const matches = await getMatches();

  const groupMatches = matches.filter((m) => m.stage === "group");
  const groupsDone = groupMatches.length > 0 && groupMatches.every((m) => m.status === "completed");
  const knockouts = matches.filter((m) => m.stage !== "group");

  return (
    <div className="space-y-8">
      <SavedBanner
        show={searchParams.kgen === "1"}
        message="✓  Knockouts created and teams locked in from current standings"
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-ink">Match Control</h1>
        <form action={logoutAdmin}>
          <button className="text-sm text-[#5B6B62] hover:underline">Log out</button>
        </form>
      </div>

      <p className="text-sm text-[#5B6B62]">
        Set a match live → click its name to enter goals, cards and stats → click
        Save All when done.
      </p>

      {/* ── GROUP STAGE ── */}
      <section>
        <h2 className="font-display text-lg text-turf mb-3">Group Stage</h2>
        <MatchList
          matches={groupMatches.sort(
            (a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
          )}
        />
      </section>

      {/* ── KNOCKOUTS ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-lg text-turf">Semi-Finals &amp; Final</h2>
          {/* Generate button — always shown; safe to run multiple times */}
          <form action={generateKnockouts}>
            <button
              type="submit"
              className={`text-sm px-4 py-1.5 border transition-colors ${
                groupsDone
                  ? "bg-pitch text-bone border-pitch hover:bg-pitch-dark"
                  : "border-[#D6E3EC] text-[#5B6B62] hover:border-pitch"
              }`}
            >
              {groupsDone
                ? "⚡ Create & fill from standings"
                : "Create & fill from standings (run after group stage)"}
            </button>
          </form>
        </div>

        {!groupsDone && (
          <p className="text-xs text-[#5B6B62]">
            Creates SF1 (Group A 1st vs Group B 2nd), SF2 (Group B 1st vs Group A
            2nd) and the Final if they&apos;re missing. Teams are filled in once all
            30 group matches are completed.
          </p>
        )}

        <MatchList
          matches={knockouts.sort(
            (a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()
          )}
        />
      </section>
    </div>
  );
}

function MatchList({
  matches,
}: {
  matches: Awaited<ReturnType<typeof getMatches>>;
}) {
  if (matches.length === 0)
    return <p className="text-sm text-[#5B6B62]">No matches yet.</p>;

  return (
    <ul className="divide-y divide-[#D6E3EC]">
      {matches.map((m) => (
        <li key={m.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={`/admin/dashboard/match/${m.id}`}
              className="font-medium hover:text-turf hover:underline"
            >
              {homeName(m)} vs {awayName(m)}
            </Link>
            <p className="text-xs text-[#5B6B62] mt-0.5">
              {stageLabel(m)} · {m.status}
              {m.status !== "upcoming" && ` · ${m.home_score}–${m.away_score}`}
            </p>
          </div>

          {/* Quick status toggle */}
          <div className="flex gap-1.5 text-xs">
            {(["upcoming", "live", "completed"] as const).map((status) => (
              <form key={status} action={updateMatchStatus.bind(null, m.id, status)}>
                <button
                  type="submit"
                  disabled={m.status === status}
                  className={`px-2.5 py-1 border transition-colors ${
                    m.status === status
                      ? "bg-pitch text-bone border-pitch"
                      : "border-[#D6E3EC] hover:border-pitch"
                  }`}
                >
                  {status === "live" ? "🔴" : status === "upcoming" ? "⬜" : "✓"}
                  {" "}{status}
                </button>
              </form>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

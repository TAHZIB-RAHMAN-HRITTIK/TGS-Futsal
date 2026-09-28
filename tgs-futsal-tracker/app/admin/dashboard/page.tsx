import Link from "next/link";
import { getMatches } from "@/lib/data";
import { logoutAdmin, updateMatchStatus } from "@/lib/actions";

export const revalidate = 0;

export default async function AdminDashboard() {
  const matches = await getMatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Match Control</h1>
        <form action={logoutAdmin}>
          <button className="text-sm underline text-[#5B6B62]">Log out</button>
        </form>
      </div>

      <p className="text-sm text-[#5B6B62]">
        Set a match live, then open it to enter goals/cards/stats as they
        happen — the site updates for everyone watching instantly.
      </p>

      <ul className="divide-y divide-[#DAD6C8]">
        {matches.map((m) => (
          <li key={m.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/admin/dashboard/match/${m.id}`} className="font-medium hover:underline">
                {m.home_team?.name} vs {m.away_team?.name}
              </Link>
              <p className="text-xs text-[#5B6B62]">
                {m.stage === "group" ? `Group ${m.group_name}` : m.stage} · {m.status}
                {m.status !== "upcoming" && ` · ${m.home_score}–${m.away_score}`}
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              {(["upcoming", "live", "completed"] as const).map((status) => (
                <form key={status} action={updateMatchStatus.bind(null, m.id, status)}>
                  <button
                    type="submit"
                    disabled={m.status === status}
                    className={`px-2 py-1 border ${
                      m.status === status
                        ? "bg-pitch text-bone border-pitch"
                        : "border-[#DAD6C8] hover:border-pitch"
                    }`}
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

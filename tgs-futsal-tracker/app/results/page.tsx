import { homeName, awayName, stageLabel } from "@/lib/labels";
import Link from "next/link";
import { getMatches } from "@/lib/data";
import LiveRefresher from "@/components/LiveRefresher";

export const revalidate = 0;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STAGE_LABEL: Record<string, string> = {
  group: "Group",
  semi: "Semi-Final",
  final: "Final",
};

export default async function ResultsPage() {
  const results = (await getMatches())
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime());

  return (
    <div className="space-y-6">
      <LiveRefresher />
      <h1 className="font-display text-3xl text-ink">Results</h1>
      {results.length === 0 && (
        <p className="text-sm text-[#5B6B62]">No results yet — check back once matches kick off.</p>
      )}
      <ul className="divide-y divide-[#DAD6C8]">
        {results.map((m) => (
          <li key={m.id} className="py-3">
            <Link href={`/match/${m.id}`} className="flex items-center justify-between gap-4">
              <span className="flex-1">{homeName(m)}</span>
              <span className="font-display text-xl tabular-nums px-3">
                {m.home_score} – {m.away_score}
              </span>
              <span className="flex-1 text-right">{awayName(m)}</span>
              <span className="text-xs text-[#5B6B62] whitespace-nowrap ml-4">
                {m.group_name ? `Grp ${m.group_name}` : STAGE_LABEL[m.stage]} ·{" "}
                {formatDate(m.kickoff_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

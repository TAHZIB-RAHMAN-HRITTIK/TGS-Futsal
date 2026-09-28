import Link from "next/link";
import { getMatches } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import LiveRefresher from "@/components/LiveRefresher";

export const revalidate = 0;

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STAGE_LABEL = { group: "Group Stage", semi: "Semi-Final", final: "Final" };

export default async function FixturesPage() {
  const matches = (await getMatches()).filter((m) => m.status !== "completed");

  const byStage = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    (acc[m.stage] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <LiveRefresher />
      <h1 className="font-display text-3xl text-ink">Fixtures</h1>
      {matches.length === 0 && (
        <p className="text-sm text-[#5B6B62]">No fixtures scheduled yet.</p>
      )}
      {(["group", "semi", "final"] as const).map(
        (stage) =>
          byStage[stage] && (
            <section key={stage}>
              <h2 className="font-display text-xl text-turf mb-3">
                {STAGE_LABEL[stage]}
              </h2>
              <ul className="divide-y divide-[#DAD6C8]">
                {byStage[stage].map((m) => (
                  <li key={m.id} className="py-3">
                    <Link href={`/match/${m.id}`} className="flex items-center justify-between gap-4">
                      <span className="flex-1">
                        {m.home_team?.name}{" "}
                        <span className="text-[#5B6B62]">vs</span>{" "}
                        {m.away_team?.name}
                      </span>
                      <span className="text-xs text-[#5B6B62] whitespace-nowrap">
                        {m.group_name ? `Grp ${m.group_name} · ` : ""}
                        {formatKickoff(m.kickoff_at)}
                      </span>
                      <StatusBadge status={m.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
      )}
    </div>
  );
}

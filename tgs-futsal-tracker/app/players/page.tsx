import { getPlayerLeaderboard, PlayerLeaderboardRow } from "@/lib/data";
import LiveRefresher from "@/components/LiveRefresher";

export const revalidate = 0;

function top(rows: PlayerLeaderboardRow[], key: keyof PlayerLeaderboardRow, min = 1) {
  return [...rows]
    .filter((r) => (r[key] as number) >= min)
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, 8);
}

export default async function PlayersPage() {
  const rows = await getPlayerLeaderboard();

  const boards: {
    title: string;
    key: keyof PlayerLeaderboardRow;
    unit: string;
  }[] = [
    { title: "Top Scorers", key: "goals", unit: "goals" },
    { title: "Top Assists", key: "assists", unit: "assists" },
    { title: "Man of the Match Awards", key: "motm", unit: "MOTM" },
    { title: "Most Saves", key: "saves", unit: "saves" },
    { title: "Most Clean Sheets", key: "clean_sheets", unit: "clean sheets" },
    { title: "Highest Average Rating", key: "avg_rating", unit: "avg" },
  ];

  return (
    <div className="space-y-10">
      <LiveRefresher />
      <h1 className="font-display text-3xl text-ink">Player Stats</h1>

      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
        {boards.map((board) => (
          <section key={board.key}>
            <h2 className="font-display text-lg text-turf mb-3">{board.title}</h2>
            <ol className="divide-y divide-[#DAD6C8]">
              {top(rows, board.key).map((row, i) => (
                <li key={row.player.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-[#5B6B62] tabular-nums">{i + 1}</span>
                    <span className="font-medium">{row.player.name}</span>
                    <span className="text-[#5B6B62] text-xs">{row.team?.name}</span>
                  </span>
                  <span className="tabular-nums font-semibold">
                    {row[board.key] as number}
                  </span>
                </li>
              ))}
              {top(rows, board.key).length === 0 && (
                <p className="text-xs text-[#5B6B62] py-2">No data yet.</p>
              )}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

import { BarChart3, CheckCircle2 } from "lucide-react";
import { Button, StatTile } from "@/components/ui";
import { calculateStats, formatNumber } from "@/lib/stats";
import type { Room, VoteValue } from "@/types/planning";

export function ResultsPanel({
  room,
  isHost,
  onFinalize,
}: {
  room: Room;
  isHost: boolean;
  onFinalize: (value: VoteValue) => void;
}) {
  const stats = calculateStats(room.participants, room.cards);
  const currentStory = room.stories[room.currentStoryIndex];
  const maxCount = Math.max(1, ...stats.distribution.map((item) => item.count));

  return (
    <section className="rounded-lg border border-cyan-100 bg-white p-5 shadow-xl shadow-blue-950/8">
      <div className="flex items-center gap-2 text-[#08245c]">
        <BarChart3 className="size-5 text-[#0078ff]" />
        <h2 className="text-lg font-bold">Resultats</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Moyenne" value={formatNumber(stats.average)} />
        <StatTile label="Mediane" value={formatNumber(stats.median)} />
        <StatTile label="Min" value={formatNumber(stats.min)} />
        <StatTile label="Max" value={formatNumber(stats.max)} />
      </div>
      <p className="mt-4 rounded-lg bg-[#08245c] px-4 py-3 text-sm font-semibold text-white">{stats.message}</p>
      <div className="mt-5 grid gap-3">
        {stats.distribution.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">Aucun vote numerique a visualiser.</div>
        ) : (
          stats.distribution.map((item) => (
            <div key={item.value} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
              <div className="font-bold text-[#08245c]">{item.value}</div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-[#0078ff] to-orange-400"
                  style={{ width: `${Math.max(12, (item.count / maxCount) * 100)}%` }}
                />
              </div>
              <div className="text-right font-semibold text-slate-500">{item.count}</div>
            </div>
          ))
        )}
      </div>
      {isHost && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold text-slate-700">Estimation retenue</div>
          <div className="flex flex-wrap gap-2">
            {room.cards.map((card) => (
              <Button key={card} variant={currentStory.finalEstimate === card ? "primary" : "secondary"} onClick={() => onFinalize(card)}>
                {card}
              </Button>
            ))}
          </div>
        </div>
      )}
      {currentStory.finalEstimate && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="size-5" />
          Estimation retenue : {currentStory.finalEstimate} points
        </div>
      )}
    </section>
  );
}

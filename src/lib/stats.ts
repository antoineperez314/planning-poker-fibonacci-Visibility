import type { Participant, VoteValue } from "@/types/planning";

export type VoteStats = {
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  distribution: Array<{ value: VoteValue; count: number; percentage: number }>;
  outliers: Set<string>;
  message: string;
};

export function numericVote(value: VoteValue | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculateStats(participants: Participant[], cards: VoteValue[]): VoteStats {
  const votes = participants.map((participant) => ({
    id: participant.id,
    value: participant.vote,
    numeric: numericVote(participant.vote),
  }));
  const numeric = votes.map((vote) => vote.numeric).filter((value): value is number => value !== null);
  const average = numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
  const sorted = [...numeric].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length
    ? sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2
    : null;
  const min = sorted.length ? sorted[0] : null;
  const max = sorted.length ? sorted[sorted.length - 1] : null;
  const totalVotes = votes.filter((vote) => vote.value).length || 1;
  const distribution = cards
    .map((card) => {
      const count = votes.filter((vote) => vote.value === card).length;
      return { value: card, count, percentage: Math.round((count / totalVotes) * 100) };
    })
    .filter((item) => item.count > 0);
  const spread = max !== null && min !== null ? max - min : 0;
  const outliers = new Set(
    votes
      .filter((vote) => average !== null && vote.numeric !== null && Math.abs(vote.numeric - average) >= Math.max(8, spread * 0.45))
      .map((vote) => vote.id),
  );

  return {
    average,
    median,
    min,
    max,
    distribution,
    outliers,
    message:
      numeric.length <= 1 || spread <= 5
        ? "Les estimations sont proches, vous pouvez valider."
        : "Les estimations sont tres dispersees, une discussion est recommandee.",
  };
}

export function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

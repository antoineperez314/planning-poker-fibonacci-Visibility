import type { Room } from "@/types/planning";

export function exportHistoryCsv(room: Room) {
  const rows = [
    ["Story", "Estimation retenue", "Date"],
    ...room.history.map((entry) => [entry.story, entry.estimate, new Date(entry.date).toLocaleString("fr-FR")]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${room.code}-planning-poker.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

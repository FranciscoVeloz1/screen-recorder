export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m}:${ss}`;
  }

  return `${m}:${ss}`;
}

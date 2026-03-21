export function Duration({ ms }: { ms: number | null | undefined }) {
  if (ms == null || Number.isNaN(ms)) return <span className="text-[var(--color-report-muted)]">—</span>
  if (ms < 1000) return <span>{ms}ms</span>
  const s = (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)
  return <span>{s}s</span>
}

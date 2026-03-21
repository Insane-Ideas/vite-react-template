import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  passed: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  failed: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  skipped: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  timedOut: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  interrupted: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status ?? 'unknown').toLowerCase()
  const style =
    statusStyles[s] ??
    'bg-white/10 text-[var(--color-report-muted)] ring-white/10'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize',
        style
      )}
    >
      {status ?? 'unknown'}
    </span>
  )
}

import type { TestRunRow } from '@/types/testReport'
import { Duration } from './Duration'
import { StatusBadge } from './StatusBadge'

function formatTs(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

type RunHeaderProps = {
  run: TestRunRow
}

export function RunHeader({ run }: RunHeaderProps) {
  const started = formatTs(run.started_at)
  const finished = formatTs(run.finished_at)
  const durationMs =
    run.started_at && run.finished_at
      ? Math.max(
          0,
          new Date(run.finished_at).getTime() -
            new Date(run.started_at).getTime()
        )
      : null

  return (
    <header className="border-b border-white/10 bg-[var(--color-report-surface)] px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={run.status} />
            <h1 className="truncate text-lg font-semibold text-slate-50">
              {run.run_key ?? run.id}
            </h1>
          </div>
          <p className="text-xs text-[var(--color-report-muted)]">
            Started {started} · Finished {finished}
            {durationMs != null && (
              <>
                {' '}
                · Run <Duration ms={durationMs} />
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-report-muted)]">
            {run.project && (
              <span>
                Project:{' '}
                <span className="text-slate-300">{run.project}</span>
              </span>
            )}
            {run.branch && (
              <span>
                Branch:{' '}
                <span className="font-mono text-slate-300">{run.branch}</span>
              </span>
            )}
            {run.commit_sha && (
              <span>
                Commit:{' '}
                <span className="font-mono text-slate-300">
                  {run.commit_sha.slice(0, 7)}
                </span>
              </span>
            )}
            {run.trigger_source && (
              <span>
                Trigger: <span className="text-slate-300">{run.trigger_source}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-200">
            total {run.total ?? '—'}
          </span>
          <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
            passed {run.passed ?? '—'}
          </span>
          <span className="rounded-md bg-rose-500/15 px-2 py-1 text-xs text-rose-200">
            failed {run.failed ?? '—'}
          </span>
          <span className="rounded-md bg-amber-500/15 px-2 py-1 text-xs text-amber-100">
            skipped {run.skipped ?? '—'}
          </span>
        </div>
      </div>
    </header>
  )
}

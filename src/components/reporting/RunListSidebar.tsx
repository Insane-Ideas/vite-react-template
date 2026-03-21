import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { TestRunListRow } from '@/types/testReport'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from './StatusBadge'

type RunListSidebarProps = {
  runs: TestRunListRow[]
  loading: boolean
  error: string | null
}

export function RunListSidebar({ runs, loading, error }: RunListSidebarProps) {
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const projects = useMemo(() => {
    const s = new Set<string>()
    for (const r of runs) {
      if (r.project) s.add(r.project)
    }
    return [...s].sort()
  }, [runs])

  const statuses = useMemo(() => {
    const s = new Set<string>()
    for (const r of runs) {
      if (r.status) s.add(r.status)
    }
    return [...s].sort()
  }, [runs])

  const filtered = useMemo(() => {
    const p = projectFilter.trim().toLowerCase()
    const st = statusFilter.trim().toLowerCase()
    const q = search.trim().toLowerCase()
    return runs.filter((r) => {
      if (p && (r.project ?? '').toLowerCase() !== p) return false
      if (st && (r.status ?? '').toLowerCase() !== st) return false
      if (q) {
        const key = (r.run_key ?? '').toLowerCase()
        if (!key.includes(q)) return false
      }
      return true
    })
  }, [runs, projectFilter, statusFilter, search])

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-white/10 bg-[var(--color-report-surface)]">
      <div className="shrink-0 space-y-3 border-b border-white/10 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Test runs</h2>
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
          <Search className="size-4 shrink-0 text-[var(--color-report-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search run_key…"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-[var(--color-report-muted)]"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-slate-100 outline-none"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-slate-100 outline-none"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {loading && (
            <p className="px-2 py-4 text-sm text-[var(--color-report-muted)]">
              Loading runs…
            </p>
          )}
          {error && (
            <p className="px-2 py-4 text-sm text-rose-300">{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-2 py-4 text-sm text-[var(--color-report-muted)]">
              No runs match filters.
            </p>
          )}
          <ul className="space-y-1">
            {filtered.map((r) => (
              <li key={r.id}>
                <NavLink
                  to={`/runs/${r.id}`}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:bg-white/[0.06]',
                      isActive &&
                        'border-[var(--color-report-accent)]/40 bg-[var(--color-report-accent)]/10'
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-[var(--color-report-muted)]">
                      {r.started_at
                        ? new Date(r.started_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-slate-300">
                    {r.run_key ?? r.id}
                  </p>
                  {r.project && (
                    <p className="truncate text-xs text-[var(--color-report-muted)]">
                      {r.project}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-report-muted)]">
                    <span className="text-emerald-300/90">{r.passed ?? 0}</span>
                    {' / '}
                    <span className="text-rose-300/90">{r.failed ?? 0}</span>
                    {' / '}
                    <span className="text-amber-200/80">{r.skipped ?? 0}</span>
                  </p>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronUp, LogOut, Search, Shield, User } from 'lucide-react'
import type { TestRunListRow } from '@/types/testReport'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProject } from '@/contexts/ProjectContext'
import { fetchAdminPendingRequests } from '@/lib/supabase/queries'
import { StatusBadge } from './StatusBadge'

type RunListSidebarProps = {
  runs: TestRunListRow[]
  loading: boolean
  error: string | null
  userEmail?: string
  onSignOut: () => void | Promise<void>
}

export function RunListSidebar({
  runs,
  loading,
  error,
  userEmail,
  onSignOut,
}: RunListSidebarProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const menuRootRef = useRef<HTMLDivElement | null>(null)
  const { selectedProjectId, selectedRole } = useProject()

  const statuses = useMemo(() => {
    const s = new Set<string>()
    for (const r of runs) {
      if (r.status) s.add(r.status)
    }
    return [...s].sort()
  }, [runs])

  const filtered = useMemo(() => {
    const st = statusFilter.trim().toLowerCase()
    const q = search.trim().toLowerCase()
    return runs.filter((r) => {
      if (st && (r.status ?? '').toLowerCase() !== st) return false
      if (q) {
        const key = (r.run_key ?? '').toLowerCase()
        if (!key.includes(q)) return false
      }
      return true
    })
  }, [runs, statusFilter, search])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRootRef.current) return
      if (menuRootRef.current.contains(event.target as Node)) return
      setMenuOpen(false)
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onEscape)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPendingCount() {
      if (!selectedProjectId || selectedRole !== 'admin') {
        setPendingRequestsCount(0)
        return
      }
      const { data, error: reqError } = await fetchAdminPendingRequests(
        selectedProjectId
      )
      if (cancelled || reqError) return
      setPendingRequestsCount(data.length)
    }

    void loadPendingCount()
    return () => {
      cancelled = true
    }
  }, [selectedProjectId, selectedRole])

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-white/10 bg-report-surface">
      <div className="shrink-0 space-y-3 border-b border-white/10 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Test runs</h2>
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
          <Search className="size-4 shrink-0 text-report-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search run_key…"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-report-muted"
          />
        </label>
        <div className="grid grid-cols-1 gap-2">
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
            <p className="px-2 py-4 text-sm text-report-muted">
              Loading runs…
            </p>
          )}
          {error && (
            <p className="px-2 py-4 text-sm text-rose-300">{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-2 py-4 text-sm text-report-muted">
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
                      'block rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:bg-white/6',
                      isActive &&
                        'border-report-accent/40 bg-report-accent/10'
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-report-muted">
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
                  {(r.project_name || r.project || r.project_slug) && (
                    <p className="truncate text-xs text-report-muted">
                      {r.project_name ?? r.project ?? r.project_slug}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-report-muted">
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

      <div
        ref={menuRootRef}
        className="relative shrink-0 border-t border-white/10 p-3"
      >
        {menuOpen && (
          <div className="absolute inset-x-3 bottom-[calc(100%+0.5rem)] z-20 rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
            {selectedRole === 'admin' && (
              <NavLink
                to="/admin/access-requests"
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-100 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Shield className="size-4 text-report-muted" />
                  Access requests
                </span>
                {pendingRequestsCount > 0 ? (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-emerald-950">
                    {pendingRequestsCount}
                  </span>
                ) : null}
              </NavLink>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-100 hover:bg-white/10"
              onClick={() => {
                setMenuOpen(false)
                void onSignOut()
              }}
            >
              <LogOut className="size-4 text-report-muted" />
              Logout
            </button>
          </div>
        )}
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left hover:bg-white/5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex min-w-0 items-center gap-2">
            <User className="size-4 shrink-0 text-report-muted" />
            <span className="truncate text-sm text-slate-100">
              {userEmail ?? 'Profile'}
            </span>
          </span>
          <span className="ml-2 flex items-center gap-2">
            {pendingRequestsCount > 0 ? (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-emerald-950">
                {pendingRequestsCount}
              </span>
            ) : null}
            <ChevronUp
              className={cn(
                'size-4 shrink-0 text-report-muted transition-transform',
                !menuOpen && 'rotate-180'
              )}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

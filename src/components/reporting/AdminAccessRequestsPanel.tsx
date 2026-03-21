import { useEffect, useState } from 'react'
import {
  fetchAdminPendingRequests,
  reviewAccessRequest,
} from '@/lib/supabase/queries'
import { useProject } from '@/contexts/ProjectContext'
import type { ProjectAccessRequest, ProjectRole } from '@/types/testReport'

export function AdminAccessRequestsPanel() {
  const { selectedProjectId, selectedRole, refetch } = useProject()
  const [requests, setRequests] = useState<ProjectAccessRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      if (!selectedProjectId || selectedRole !== 'admin') {
        setRequests([])
        return
      }
      setLoading(true)
      setError(null)
      const { data, error: reqError } = await fetchAdminPendingRequests(
        selectedProjectId
      )
      if (reqError) setError(reqError.message)
      setRequests(data)
      setLoading(false)
    }
    void run()
  }, [selectedProjectId, selectedRole])

  async function review(
    requestId: string,
    decision: 'approved' | 'rejected',
    role: ProjectRole = 'viewer'
  ) {
    setError(null)
    const { error: reqError } = await reviewAccessRequest(
      requestId,
      decision,
      role
    )
    if (reqError) {
      setError(reqError.message)
      return
    }
    if (selectedProjectId) {
      const { data } = await fetchAdminPendingRequests(selectedProjectId)
      setRequests(data)
    }
    await refetch()
  }

  if (selectedRole !== 'admin') return null

  return (
    <div className="rounded-xl border border-white/10 bg-report-surface p-4">
      <h3 className="text-sm font-semibold text-slate-100">Access requests (admin)</h3>
      {loading && <p className="mt-2 text-xs text-report-muted">Loading…</p>}
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      {!loading && !error && requests.length === 0 && (
        <p className="mt-2 text-xs text-report-muted">
          No pending requests.
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {requests.map((request) => (
          <li
            key={request.id}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2"
          >
            <p className="text-xs text-slate-200">
              User:{' '}
              <span className="font-medium">
                {request.requester_name ?? request.requester_email ?? 'Unknown user'}
              </span>
              {request.requester_email &&
              request.requester_name !== request.requester_email ? (
                <span className="text-report-muted"> ({request.requester_email})</span>
              ) : null}
            </p>
            <p className="mt-1 text-[11px] text-report-muted">
              id: <span className="font-mono">{request.user_id}</span>
            </p>
            {request.reason && (
              <p className="mt-1 text-xs text-report-muted">
                Reason: {request.reason}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void review(request.id, 'approved', 'viewer')}
                className="rounded-md bg-emerald-500/90 px-2 py-1 text-xs font-medium text-emerald-950"
              >
                Approve viewer
              </button>
              <button
                type="button"
                onClick={() => void review(request.id, 'approved', 'editor')}
                className="rounded-md bg-sky-500/90 px-2 py-1 text-xs font-medium text-sky-950"
              >
                Approve editor
              </button>
              <button
                type="button"
                onClick={() => void review(request.id, 'rejected')}
                className="rounded-md bg-rose-500/90 px-2 py-1 text-xs font-medium text-rose-950"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

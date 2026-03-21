import { useMemo, useState } from 'react'
import {
  createAccessRequest,
  fetchMyAccessRequest,
} from '@/lib/supabase/queries'
import { useProject } from '@/contexts/ProjectContext'
import type { ProjectAccessRequest } from '@/types/testReport'

export function ProjectAccessRequestPanel() {
  const { allProjects, refetch } = useProject()
  const [projectId, setProjectId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<ProjectAccessRequest | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const selectedProject = useMemo(
    () => allProjects.find((project) => project.id === projectId) ?? null,
    [allProjects, projectId]
  )

  async function loadLatestRequest(nextProjectId: string) {
    setRequest(null)
    setSuccessMessage(null)
    if (!nextProjectId) return
    const { data, error: reqError } = await fetchMyAccessRequest(nextProjectId)
    if (reqError) {
      setError(reqError.message)
      return
    }
    setRequest(data)
    if (data?.status === 'pending') {
      setSuccessMessage('Access requested.')
    }
  }

  async function submitRequest() {
    if (!projectId) return
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    const { data, error: reqError } = await createAccessRequest(projectId, reason)
    if (reqError) {
      setError(reqError.message)
      setLoading(false)
      return
    }
    setRequest(data)
    setReason('')
    if (data?.status === 'pending') {
      setSuccessMessage('Access requested.')
    } else {
      setSuccessMessage('Request submitted.')
    }
    setLoading(false)
    await refetch()
  }

  return (
    <div className="w-full max-w-xl rounded-xl border border-white/10 bg-report-surface p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-slate-100">Request project access</h2>
      <p className="mt-2 text-sm text-report-muted">
        You are signed in but not yet assigned to any project.
      </p>
      <div className="mt-5 space-y-3">
        <select
          value={projectId}
          onChange={(e) => {
            const next = e.target.value
            setProjectId(next)
            void loadLatestRequest(next)
          }}
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none"
        >
          <option value="">Select project</option>
          {allProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.slug})
            </option>
          ))}
        </select>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="min-h-24 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-report-muted"
        />
        <button
          type="button"
          disabled={!projectId || loading}
          onClick={() => void submitRequest()}
          className="rounded-lg bg-report-accent px-4 py-2 text-sm font-medium text-report-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Request access'}
        </button>
      </div>
      {selectedProject && request && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
          Latest request for <span className="font-medium">{selectedProject.name}</span>:
          <span className="ml-2 uppercase tracking-wide text-report-muted">
            {request.status}
          </span>
        </div>
      )}
      {successMessage && (
        <p className="mt-3 text-sm text-emerald-300">{successMessage}</p>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
  )
}

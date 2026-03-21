import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchTestResultsForRun,
  fetchTestRunById,
} from '@/lib/supabase/queries'
import type { TestResultRow, TestRunRow } from '@/types/testReport'
import { RunHeader } from '@/components/reporting/RunHeader'
import { TestList } from '@/components/reporting/TestList'

export default function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<TestRunRow | null>(null)
  const [results, setResults] = useState<TestResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const [runRes, resRes] = await Promise.all([
      fetchTestRunById(id),
      fetchTestResultsForRun(id),
    ])
    const parts: string[] = []
    if (runRes.error) parts.push(runRes.error.message)
    if (resRes.error) parts.push(resRes.error.message)
    setError(parts.length ? parts.join(' · ') : null)

    setRun(runRes.error ? null : runRes.data)
    setResults(resRes.error ? [] : resRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!runId) {
      setError('Missing run id')
      setLoading(false)
      return
    }
    void load(runId)
  }, [runId, load])

  const toggle = useCallback((id: string) => {
    setExpandedId((cur) => (cur === id ? null : id))
  }, [])

  if (!runId) {
    return (
      <div className="p-8 text-sm text-rose-300">Invalid run link.</div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-[var(--color-report-muted)]">
        Loading run…
      </div>
    )
  }

  if (error && !run) {
    return (
      <div className="p-8 text-sm text-rose-300">{error}</div>
    )
  }

  if (!run) {
    return (
      <div className="p-8 text-sm text-[var(--color-report-muted)]">
        Run not found.
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <RunHeader run={run} />
      {error && (
        <div className="border-b border-amber-500/30 bg-amber-950/30 px-6 py-2 text-sm text-amber-100">
          Tests query: {error}
        </div>
      )}
      <div className="p-6">
        <h2 className="mb-3 text-sm font-medium text-slate-200">Tests</h2>
        <TestList
          results={results}
          expandedId={expandedId}
          onToggle={toggle}
        />
      </div>
    </div>
  )
}

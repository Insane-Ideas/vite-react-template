import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { fetchTestRunsList } from '@/lib/supabase/queries'
import { useProject } from '@/contexts/ProjectContext'
import type { TestRunListRow } from '@/types/testReport'

type ReportingRunsValue = {
  runs: TestRunListRow[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const ReportingRunsContext = createContext<ReportingRunsValue | null>(null)

export function ReportingRunsProvider({ children }: { children: ReactNode }) {
  const { selectedProjectId } = useProject()
  const [runs, setRuns] = useState<TestRunListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!selectedProjectId) {
      setRuns([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchTestRunsList(selectedProjectId)
    if (err) setError(err.message)
    setRuns(data)
    setLoading(false)
  }, [selectedProjectId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const value: ReportingRunsValue = { runs, loading, error, refetch }

  return (
    <ReportingRunsContext.Provider value={value}>
      {children}
    </ReportingRunsContext.Provider>
  )
}

export function useReportingRuns() {
  const ctx = useContext(ReportingRunsContext)
  if (!ctx)
    throw new Error('useReportingRuns must be used within ReportingRunsProvider')
  return ctx
}

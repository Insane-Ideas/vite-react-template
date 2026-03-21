import { Outlet } from 'react-router-dom'
import {
  ReportingRunsProvider,
  useReportingRuns,
} from '@/contexts/ReportingRunsContext'
import { RunListSidebar } from '@/components/reporting/RunListSidebar'

function ReportingShell() {
  const { runs, loading, error } = useReportingRuns()

  return (
    <div className="flex h-[100dvh] min-h-0 w-full">
      <aside className="w-[280px] shrink-0">
        <RunListSidebar runs={runs} loading={loading} error={error} />
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function ReportingLayout() {
  return (
    <ReportingRunsProvider>
      <ReportingShell />
    </ReportingRunsProvider>
  )
}

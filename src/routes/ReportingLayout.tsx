import { Outlet } from 'react-router-dom'
import {
  ReportingRunsProvider,
  useReportingRuns,
} from '@/contexts/ReportingRunsContext'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { ProjectSelector } from '@/components/reporting/ProjectSelector'
import { RunListSidebar } from '@/components/reporting/RunListSidebar'

function ReportingShell() {
  const { runs, loading, error } = useReportingRuns()
  const { session, signOut } = useAuth()
  const {
    myProjects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    selectedRole,
  } = useProject()

  if (!selectedProjectId) {
    return (
      <div className="flex h-dvh items-center justify-center p-8 text-report-muted">
        No project selected.
      </div>
    )
  }

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 bg-report-surface px-4 py-2">
        <ProjectSelector
          projects={myProjects}
          selectedProjectId={selectedProjectId}
          onSelect={setSelectedProjectId}
        />
        <p className="text-xs text-report-muted">
          {selectedProject?.name ?? 'Unknown'} · role: {selectedRole ?? 'viewer'}
        </p>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-[280px] shrink-0">
          <RunListSidebar
            runs={runs}
            loading={loading}
            error={error}
            userEmail={session?.user?.email}
            onSignOut={signOut}
          />
        </aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
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

import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { ProjectAccessRequestPanel } from '@/components/reporting/ProjectAccessRequestPanel'
import { RunListSidebar } from '@/components/reporting/RunListSidebar'

export default function ProjectGate() {
  const { loading, error, myProjects } = useProject()
  const { session, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8 text-report-muted">
        Loading projects…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <p className="max-w-lg text-sm text-rose-300">{error}</p>
      </div>
    )
  }

  if (myProjects.length === 0) {
    return (
      <div className="flex h-dvh min-h-0">
        <aside className="w-[280px] shrink-0">
          <RunListSidebar
            runs={[]}
            loading={false}
            error={null}
            userEmail={session?.user?.email}
            onSignOut={signOut}
          />
        </aside>
        <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-6 py-16">
          <ProjectAccessRequestPanel />
        </main>
      </div>
    )
  }

  return <Outlet />
}

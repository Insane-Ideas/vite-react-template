import { AdminAccessRequestsPanel } from '@/components/reporting/AdminAccessRequestsPanel'
import { useProject } from '@/contexts/ProjectContext'

export default function AdminAccessRequestsPage() {
  const { selectedRole } = useProject()

  return (
    <div className="p-4 md:p-6">
      {selectedRole === 'admin' ? (
        <AdminAccessRequestsPanel />
      ) : (
        <p className="text-sm text-report-muted">Admin access required.</p>
      )}
    </div>
  )
}

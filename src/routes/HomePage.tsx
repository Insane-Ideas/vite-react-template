import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchLatestTestRunIdForProject } from '@/lib/supabase/queries'
import { useProject } from '@/contexts/ProjectContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { selectedProjectId } = useProject()
  const [message, setMessage] = useState('Looking for the latest run…')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!selectedProjectId) {
        setMessage('No project selected.')
        return
      }
      const { id, error } = await fetchLatestTestRunIdForProject(selectedProjectId)
      if (cancelled) return
      if (error) {
        setMessage(`Could not load runs: ${error.message}`)
        return
      }
      if (id) {
        navigate(`/runs/${id}`, { replace: true })
        return
      }
      setMessage('No runs yet. Select a run from the sidebar when available.')
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [navigate, selectedProjectId])

  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center px-6 py-12">
      <p className="max-w-md text-center text-sm text-report-muted">
        {message}
      </p>
    </div>
  )
}

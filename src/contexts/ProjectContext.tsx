import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAllProjects, fetchMyProjects } from '@/lib/supabase/queries'
import type { ProjectSummary } from '@/types/testReport'

type PublicProject = Pick<ProjectSummary, 'id' | 'slug' | 'name'>

type ProjectContextValue = {
  myProjects: ProjectSummary[]
  allProjects: PublicProject[]
  selectedProjectId: string | null
  selectedProject: ProjectSummary | null
  selectedRole: ProjectSummary['role'] | null
  loading: boolean
  error: string | null
  setSelectedProjectId: (projectId: string) => void
  refetch: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

function selectedProjectKey(userId: string) {
  return `selected_project_v1:${userId}`
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
  const [myProjects, setMyProjects] = useState<ProjectSummary[]>([])
  const [allProjects, setAllProjects] = useState<PublicProject[]>([])
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!userId) {
      setMyProjects([])
      setAllProjects([])
      setSelectedProjectIdState(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [mineRes, allRes] = await Promise.all([
      fetchMyProjects(),
      fetchAllProjects(),
    ])
    if (mineRes.error || allRes.error) {
      setError(mineRes.error?.message ?? allRes.error?.message ?? 'Query failed')
    }
    const mine = mineRes.data
    const all = allRes.data
    setMyProjects(mine)
    setAllProjects(all)

    let saved: string | null = null
    try {
      saved = localStorage.getItem(selectedProjectKey(userId))
    } catch {
      saved = null
    }
    const nextId =
      (saved && mine.some((p) => p.id === saved) && saved) || mine[0]?.id || null
    setSelectedProjectIdState(nextId)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const setSelectedProjectId = useCallback(
    (projectId: string) => {
      setSelectedProjectIdState(projectId)
      if (!userId) return
      try {
        localStorage.setItem(selectedProjectKey(userId), projectId)
      } catch {
        /* ignore storage errors */
      }
    },
    [userId]
  )

  const selectedProject = useMemo(
    () => myProjects.find((p) => p.id === selectedProjectId) ?? null,
    [myProjects, selectedProjectId]
  )

  const selectedRole = selectedProject?.role ?? null

  const value: ProjectContextValue = {
    myProjects,
    allProjects,
    selectedProjectId,
    selectedProject,
    selectedRole,
    loading,
    error,
    setSelectedProjectId,
    refetch,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}

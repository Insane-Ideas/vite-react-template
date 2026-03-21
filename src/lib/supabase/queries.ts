import supabase from '@/lib/supabase/client'
import type {
  ProjectAccessRequest,
  ProjectSummary,
  TestResultRow,
  TestRunListRow,
  TestRunRow,
} from '@/types/testReport'

type RunSelectRow = Omit<
  TestRunListRow,
  'project_slug' | 'project_name'
> & {
  projects?: Array<{ slug: string | null; name: string | null }> | null
}

export async function fetchMyProjects(): Promise<{
  data: ProjectSummary[]
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('project_memberships')
    .select('role, projects!inner(id, slug, name)')
    .order('name', { ascending: true, referencedTable: 'projects' })

  if (error) return { data: [], error: new Error(error.message) }

  const rows = ((data ?? []) as unknown as Array<{
    role: ProjectSummary['role']
    projects:
      | Array<{ id: string; slug: string; name: string }>
      | { id: string; slug: string; name: string }
      | null
  }>)

  const mapped = rows
    .map((row) => {
      const project = Array.isArray(row.projects)
        ? row.projects[0]
        : row.projects
      if (!project) return null
      return {
        id: project.id,
        slug: project.slug,
        name: project.name,
        role: row.role,
      } satisfies ProjectSummary
    })
    .filter((row): row is ProjectSummary => Boolean(row))

  return { data: mapped, error: null }
}

export async function fetchAllProjects(): Promise<{
  data: Array<Pick<ProjectSummary, 'id' | 'slug' | 'name'>>
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, name')
    .order('name', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  return {
    data: (data ?? []) as Array<Pick<ProjectSummary, 'id' | 'slug' | 'name'>>,
    error: null,
  }
}

export async function fetchTestRunsList(projectId: string): Promise<{
  data: TestRunListRow[]
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('test_runs')
    .select(
      'id, run_key, project, project_id, status, total, passed, failed, skipped, started_at, finished_at, projects(slug, name)'
    )
    .eq('project_id', projectId)
    .order('started_at', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) return { data: [], error: new Error(error.message) }
  const mapped = ((data ?? []) as unknown as RunSelectRow[]).map((row) => ({
    ...row,
    project_slug: row.projects?.[0]?.slug ?? null,
    project_name: row.projects?.[0]?.name ?? null,
  }))
  return { data: mapped, error: null }
}

export async function fetchTestRunById(
  runId: string
): Promise<{ data: TestRunRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('test_runs')
    .select(
      'id, run_key, project, project_id, status, total, passed, failed, skipped, started_at, finished_at, branch, commit_sha, trigger_source, meta, projects(slug, name)'
    )
    .eq('id', runId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: null }
  const row = data as unknown as RunSelectRow &
    Omit<TestRunRow, keyof TestRunListRow>
  return {
    data: {
      ...row,
      project_slug: row.projects?.[0]?.slug ?? null,
      project_name: row.projects?.[0]?.name ?? null,
    } as TestRunRow,
    error: null,
  }
}

export async function fetchLatestTestRunIdForProject(projectId: string): Promise<{
  id: string | null
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('test_runs')
    .select('id')
    .eq('project_id', projectId)
    .order('started_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (error) return { id: null, error: new Error(error.message) }
  return { id: data?.id ?? null, error: null }
}

export async function fetchMyAccessRequest(
  projectId: string
): Promise<{ data: ProjectAccessRequest | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('project_access_requests')
    .select(
      'id, project_id, user_id, reason, status, created_at, reviewed_at, reviewed_by'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data as ProjectAccessRequest | null) ?? null, error: null }
}

export async function createAccessRequest(
  projectId: string,
  reason: string
): Promise<{ data: ProjectAccessRequest | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('request_project_access', {
    p_project_id: projectId,
    p_reason: reason,
  })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data as ProjectAccessRequest | null) ?? null, error: null }
}

export async function fetchAdminPendingRequests(
  projectId: string
): Promise<{ data: ProjectAccessRequest[]; error: Error | null }> {
  const { data, error } = await supabase.rpc(
    'list_admin_pending_access_requests',
    {
      p_project_id: projectId,
    }
  )

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data ?? []) as ProjectAccessRequest[], error: null }
}

export async function reviewAccessRequest(
  requestId: string,
  decision: 'approved' | 'rejected',
  role: 'viewer' | 'editor' | 'admin' = 'viewer'
): Promise<{ data: ProjectAccessRequest | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('review_project_access_request', {
    p_request_id: requestId,
    p_decision: decision,
    p_role: role,
  })
  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data as ProjectAccessRequest | null) ?? null, error: null }
}

export async function fetchTestResultsForRun(
  runId: string
): Promise<{ data: TestResultRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('test_results')
    .select(
      'id, file, title, full_title, status, duration_ms, retry, error_message, error_stack, steps, attachments'
    )
    .eq('run_id', runId)
    .order('file', { ascending: true, nullsFirst: true })
    .order('full_title', { ascending: true, nullsFirst: true })

  if (error) return { data: [], error: new Error(error.message) }
  const rows = (data ?? []) as TestResultRow[]
  rows.sort((a, b) => {
    const fa = a.status === 'failed' ? 1 : 0
    const fb = b.status === 'failed' ? 1 : 0
    if (fb !== fa) return fb - fa
    const da = a.duration_ms ?? 0
    const db = b.duration_ms ?? 0
    return db - da
  })
  return { data: rows, error: null }
}

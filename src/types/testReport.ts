export type RunStatus = string

export type ProjectRole = 'viewer' | 'editor' | 'admin'
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected'

export type ProjectSummary = {
  id: string
  slug: string
  name: string
  role: ProjectRole
}

export type ProjectAccessRequest = {
  id: string
  project_id: string
  user_id: string
  reason: string | null
  status: AccessRequestStatus
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  requester_email?: string | null
  requester_name?: string | null
}

/** Row from public.test_runs (sidebar list fields). */
export type TestRunListRow = {
  id: string
  run_key: string | null
  project: string | null
  project_id: string | null
  project_slug: string | null
  project_name: string | null
  status: RunStatus | null
  total: number | null
  passed: number | null
  failed: number | null
  skipped: number | null
  started_at: string | null
  finished_at: string | null
}

/** Full run row for header / detail. */
export type TestRunRow = TestRunListRow & {
  branch: string | null
  commit_sha: string | null
  trigger_source: string | null
  meta: Record<string, unknown> | null
}

export type TestResultStatus = string

export type StepAttachment = {
  name?: string
  contentType?: string
  path?: string
  body?: string
  json?: unknown
  [key: string]: unknown
}

/** Nested Playwright-style step tree from test_results.steps jsonb. */
export type StepNode = {
  title?: string
  category?: string
  duration?: number
  error?: { message?: string; stack?: string } | string | null
  attachments?: StepAttachment[]
  steps?: StepNode[]
  [key: string]: unknown
}

export type TestResultRow = {
  id: string
  file: string | null
  title: string | null
  full_title: string | null
  status: TestResultStatus | null
  duration_ms: number | null
  retry: number | null
  error_message: string | null
  error_stack: string | null
  steps: StepNode[] | null
  attachments: StepAttachment[] | null
}

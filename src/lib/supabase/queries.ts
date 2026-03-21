import supabase from '@/lib/supabase/client'
import type {
  TestResultRow,
  TestRunListRow,
  TestRunRow,
} from '@/types/testReport'

export async function fetchTestRunsList(): Promise<{
  data: TestRunListRow[]
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('test_runs')
    .select(
      'id, run_key, project, status, total, passed, failed, skipped, started_at, finished_at'
    )
    .order('started_at', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data ?? []) as TestRunListRow[], error: null }
}

export async function fetchTestRunById(
  runId: string
): Promise<{ data: TestRunRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('test_runs')
    .select(
      'id, run_key, project, status, total, passed, failed, skipped, started_at, finished_at, branch, commit_sha, trigger_source, meta'
    )
    .eq('id', runId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as TestRunRow | null, error: null }
}

export async function fetchLatestTestRunId(): Promise<{
  id: string | null
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('test_runs')
    .select('id')
    .order('started_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (error) return { id: null, error: new Error(error.message) }
  return { id: data?.id ?? null, error: null }
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

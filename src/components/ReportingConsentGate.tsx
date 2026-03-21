import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function consentKey(userId: string) {
  return `reporting_data_consent_v1:${userId}`
}

export default function ReportingConsentGate() {
  const { session, signOut } = useAuth()
  const userId = session?.user?.id
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!userId) {
      setAccepted(false)
      return
    }
    try {
      setAccepted(localStorage.getItem(consentKey(userId)) === '1')
    } catch {
      setAccepted(false)
    }
  }, [userId])

  const onAccept = useCallback(() => {
    if (!userId) return
    try {
      localStorage.setItem(consentKey(userId), '1')
    } catch {
      /* ignore quota */
    }
    setAccepted(true)
  }, [userId])

  if (!session?.user) {
    return <Outlet />
  }

  if (!accepted) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[var(--color-report-surface)] p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-slate-50">
            Allow test report access
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-report-muted)]">
            This app reads your Playwright run summaries and per-test results from
            Supabase (<code className="rounded bg-black/40 px-1 py-0.5 font-mono text-xs">test_runs</code>,{' '}
            <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-xs">test_results</code>),
            including error messages, stdout/stderr fields, and step JSON. Only
            continue if you intend to view that data in the browser under your
            account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-[var(--color-report-accent)] px-4 py-2 text-sm font-medium text-[var(--color-report-bg)] hover:opacity-90"
              onClick={() => void onAccept()}
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}

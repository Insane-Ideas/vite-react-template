import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AuthPanel from '@/components/AuthPanel'

export default function AuthShell() {
  const {
    session,
    authLoading,
    authError,
    signInWithGoogle,
    signOut,
  } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-8 text-[var(--color-report-muted)]">
        Loading session…
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-center text-2xl font-semibold text-slate-50">
            E2E test reporting
          </h1>
          <p className="mb-6 text-center text-sm text-[var(--color-report-muted)]">
            Sign in to load runs and drill into steps.
          </p>
          <AuthPanel
            session={session}
            authLoading={authLoading}
            authError={authError}
            onSignInWithGoogle={signInWithGoogle}
            onSignOut={signOut}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh]">
      <Outlet />
    </div>
  )
}

import type { Session } from "@supabase/supabase-js";

type AuthPanelProps = {
  session: Session | null;
  authLoading: boolean;
  authError: string | null;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

export default function AuthPanel({
  session,
  authLoading,
  authError,
  onSignInWithGoogle,
  onSignOut,
}: AuthPanelProps) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 text-left sm:p-8">
      {authLoading ? (
        <p>Loading session...</p>
      ) : session?.user ? (
        <>
          <p>
            Signed in as <strong>{session.user.email}</strong>
          </p>
          <button
            className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={() => void onSignOut()}
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <p>Sign in to open the test reporting UI.</p>
          <button
            className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={() => void onSignInWithGoogle()}
          >
            Sign in with Google
          </button>
        </>
      )}

      {authError && <p className="mt-2 text-rose-400">{authError}</p>}
    </div>
  );
}


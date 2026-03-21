import ConsentScreen from "./components/ConsentScreen";
import AuthPanel from "./components/AuthPanel";
import TodosCard from "./components/TodosCard";
import useSupabaseAuth from "./hooks/useSupabaseAuth";

function App() {
  const pathname = window.location.pathname;
  const isConsent = pathname === "/oauth/consent";

  const { session, authLoading, authError, signInWithGoogle, signOut } =
    useSupabaseAuth();

  return (
    <div className="min-h-screen bg-[#242424] px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
        {isConsent ? (
          <ConsentScreen />
        ) : (
          <>
            <h1 className="text-4xl font-semibold">Todos from Supabase</h1>

            <AuthPanel
              session={session}
              authLoading={authLoading}
              authError={authError}
              onSignInWithGoogle={signInWithGoogle}
              onSignOut={signOut}
            />
            <TodosCard session={session} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

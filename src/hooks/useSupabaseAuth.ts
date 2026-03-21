import { useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export default function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function initAuth() {
      setAuthLoading(true);
      setAuthError(null);

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // If the user just returned from Google, Supabase will provide `code` in the URL.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setAuthError(error.message);

        // Clean the URL so we don't repeatedly try exchanging on refresh.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthLoading(false);

      // Keep the UI in sync with login/logout.
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
          setAuthLoading(false);
        }
      );

      subscription = listener.subscription;
    }

    void initAuth().catch((e) => {
      setAuthLoading(false);
      setAuthError(e instanceof Error ? e.message : String(e));
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);

    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) setAuthError(error.message);
  }

  async function signOut() {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  }

  return { session, authError, authLoading, signInWithGoogle, signOut };
}


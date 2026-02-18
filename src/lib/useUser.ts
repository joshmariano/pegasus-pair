"use client";

import { useState, useEffect } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabase } from "@/src/lib/supabaseClient";

export function useUser(): {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const supabase = getSupabase();

    const loadSession = async () => {
      const { data: { session: s }, error: e } = await supabase.auth.getSession();
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, error };
}

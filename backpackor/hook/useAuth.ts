"use client";

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    // 세션 복원
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setProvider(currentUser?.app_metadata?.provider ?? null);
    });

    // 로그인/로그아웃 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setProvider(currentUser?.app_metadata?.provider ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, provider };
}

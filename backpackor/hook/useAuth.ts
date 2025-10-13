"use client";

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 초기 세션 복원
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인/로그아웃 실시간 반영
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user };
}

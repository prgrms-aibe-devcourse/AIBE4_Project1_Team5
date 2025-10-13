"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Provider } from "@supabase/supabase-js";

export function useSocialLogin() {
  const handleSocialLogin = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error(`${provider} 로그인 실패:`, err.message);
      alert("소셜 로그인 중 오류가 발생했습니다.");
    }
  };

  return { handleSocialLogin };
}
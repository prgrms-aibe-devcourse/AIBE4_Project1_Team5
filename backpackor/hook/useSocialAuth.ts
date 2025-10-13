"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useSocialAuth() {
  const router = useRouter();

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
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSocialLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("로그아웃 실패:", err.message);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return { handleSocialLogin, handleSocialLogout };
}

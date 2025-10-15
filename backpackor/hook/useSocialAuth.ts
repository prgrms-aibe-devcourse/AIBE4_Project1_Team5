"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useSocialAuth() {
  const router = useRouter();

  const handleSocialLogin = async (provider: Provider) => {
    try {
      // 현재 URL의 redirect 파라미터 추출
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");

      // redirect 파라미터가 있으면 로그인 성공 후 해당 경로로 복귀
      const redirectTo = redirectParam
        ? `${window.location.origin}${redirectParam}`
        : `${window.location.origin}/`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
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

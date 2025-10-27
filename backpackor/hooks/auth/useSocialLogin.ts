// 소셜 로그인 훅
"use client";

import { useRouter } from "next/navigation";
import { loginWithSocial, logout } from "@/apis/authApi";
import type { SocialProvider } from "@/types/auth";
import { getBaseUrl } from "@/utils/url";

export const useSocialLogin = () => {
  const router = useRouter();

  const handleLogin = async (provider: SocialProvider) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");

      // 환경에 맞는 baseUrl 사용
      const baseUrl = getBaseUrl();
      const redirectTo = redirectParam
        ? `${baseUrl}${redirectParam}`
        : `${baseUrl}/`;

      // 디버깅: 어떤 URL로 리다이렉트되는지 확인
      console.log("🔍 [로그인 디버깅]");
      console.log("  - 현재 hostname:", window.location.hostname);
      console.log("  - 감지된 baseUrl:", baseUrl);
      console.log("  - 최종 redirectTo:", redirectTo);

      const { error } = await loginWithSocial(provider, redirectTo);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error(`${provider} 로그인 실패:`, err);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        throw error;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("로그아웃 실패:", err);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return { handleLogin, handleLogout };
};

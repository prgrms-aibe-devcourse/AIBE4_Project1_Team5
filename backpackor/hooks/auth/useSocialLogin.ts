// 소셜 로그인 훅
"use client";

import { useRouter } from "next/navigation";
import { loginWithSocial, logout } from "@/apis/authApi";
import type { SocialProvider } from "@/types/auth";

export const useSocialLogin = () => {
  const router = useRouter();

  const handleLogin = async (provider: SocialProvider) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirect");

      const redirectTo = redirectParam
        ? `${window.location.origin}${redirectParam}`
        : `${window.location.origin}/`;

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

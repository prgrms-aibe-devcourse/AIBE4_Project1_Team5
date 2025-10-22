"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSocialLogin } from "@/hooks/auth/useSocialLogin";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";

const SOCIAL_PROVIDERS = [
  {
    provider: "google" as const,
    logoUrl:
      "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/google_logo.png",
  },
  {
    provider: "kakao" as const,
    logoUrl:
      "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/kakao_logo.png",
  },
  {
    provider: "github" as const,
    logoUrl:
      "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/github_logo.png",
  },
] as const;

export default function LoginClientUI() {
  const { handleLogin } = useSocialLogin();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const redirectParam = searchParams.get("redirect");
          router.replace(redirectParam || "/");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 mt-[-2rem]">
      <div className="w-full max-w-md py-20 px-12 space-y-20 bg-white rounded-3xl shadow-xl">
        {/* 제목 영역 */}
        <div className="text-center space-y-5">
          <h1 className="text-4xl font-bold text-gray-900">로그인</h1>
          <p className="text-lg text-gray-600">
            소셜 계정으로 간편하게 시작해보세요
          </p>
          <div className="w-40 mx-auto border-t-2 border-gray-200 opacity-70 mt-6" />
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="flex justify-center items-center space-x-10">
          {SOCIAL_PROVIDERS.map(({ provider, logoUrl }) => (
            <SocialLoginButton
              key={provider}
              provider={provider}
              logoUrl={logoUrl}
              onLogin={handleLogin}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

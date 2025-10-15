"use client";

import { useSocialAuth } from "@/hook/useSocialAuth";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { handleSocialLogin } = useSocialAuth();
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
      {/* 로그인 카드 */}
      <div className="w-full max-w-md py-20 px-12 space-y-20 bg-white rounded-3xl shadow-xl">
        {/* 제목 영역 */}
        <div className="text-center space-y-5">
          <h1 className="text-4xl font-bold text-gray-900">로그인</h1>
          <p className="text-lg text-gray-600">
            소셜 계정으로 간편하게 시작해보세요
          </p>

          {/* 구분선 */}
          <div className="w-40 mx-auto border-t-2 border-gray-200 opacity-70 mt-6" />
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="flex justify-center items-center space-x-10">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:scale-110 transition-transform shadow-md"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/google_logo.png"
              alt="Google logo"
              className="w-16 h-16 object-contain"
            />
          </button>

          {/* Kakao */}
          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:scale-110 transition-transform shadow-md"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/kakao_logo.png"
              alt="Kakao logo"
              className="w-16 h-16 object-contain"
            />
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:scale-110 transition-transform shadow-md"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/github_logo.png"
              alt="GitHub logo"
              className="w-16 h-16 object-cover rounded-full"
            />
          </button>
        </div>
      </div>
    </main>
  );
}

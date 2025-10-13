"use client";

import Link from "next/link";
import { useSocialLogin } from "./useSocialLogin";

export default function LoginPage() {
  const { handleSocialLogin } = useSocialLogin();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
          <p className="mt-2 text-sm text-gray-600">
            지금 바로 여행을 시작해보세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="sr-only">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="이메일 주소"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="비밀번호"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="text-right">
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:text-indigo-500"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary w-full flex justify-center shadow-sm"
            >
              로그인
            </button>
          </div>
        </form>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        {/* 소셜 로그인 */}
        <div className="flex justify-center items-center space-x-6 mt-8">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:scale-105 transition-transform shadow-sm"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/google_logo.png"
              alt="Google logo"
              className="w-10 h-10 object-contain"
            />
          </button>

          {/* Kakao */}
          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:scale-105 transition-transform shadow-sm"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/kakao_logo.png"
              alt="Kakao logo"
              className="w-10 h-10 object-contain"
            />
          </button>

          {/* Naver */}
          <button
            type="button"
            onClick={() => handleSocialLogin("naver" as any)}
            className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:scale-105 transition-transform shadow-sm"
          >
            <img
              src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/social/naver_logo.png"
              alt="Naver logo"
              className="w-10 h-10 object-contain"
            />
          </button>
        </div>
        {/* 회원가입 안내 */}
        <div className="text-sm text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-indigo-500"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

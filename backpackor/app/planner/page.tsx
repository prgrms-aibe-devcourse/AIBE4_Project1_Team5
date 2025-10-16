"use client";

import { useAuth } from "@/hook/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlannerStartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // 인증 상태 확인 및 리다이렉트 처리
  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirectPath = encodeURIComponent("/planner");
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [user, loading, router]);

  // 인증 로딩 중
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white">
        <div className="max-w-6xl w-full px-8">
          {/* 제목 스켈레톤 */}
          <div className="mb-4 space-y-3">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-2/3 mx-auto" />
          </div>

          {/* 설명 스켈레톤 */}
          <div className="mb-16 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
          </div>

          {/* 카드 스켈레톤 */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="p-8 bg-gray-50 border border-gray-200 rounded-2xl"
              >
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white py-12">
      <div className="max-w-6xl w-full px-8">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            어떤 여행을 계획하고 싶으신가요?
          </h1>
          <p className="text-lg text-gray-600">
            두 가지 방법으로 당신만의 완벽한 여행을 만들 수 있습니다
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI로 계획 짜기 */}
          <Link href="/planner/ai" className="group">
            <div className="relative h-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

              <div className="relative">
                {/* 아이콘 */}
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  AI로 똑똑하게 계획 짜기
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  몇 가지 질문에 답하면, AI가 당신의 취향에 꼭 맞는 여행 코스를
                  추천해 드립니다.
                </p>

                {/* 특징 */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    AI 기반 맞춤형 추천 알고리즘
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    추천 후 자유로운 커스터마이징
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    실시간 지도 기반 경로 시각화
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  <span>시작하기</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 직접 계획 짜기 */}
          <Link href="/planner/new" className="group">
            <div className="relative h-full p-8 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-200 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />

              <div className="relative">
                {/* 아이콘 */}
                <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
                  직접 여행 계획 짜기
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  가고 싶은 곳들을 자유롭게 담아 나만의 여행 일정을 직접 만들어
                  보세요.
                </p>

                {/* 특징 */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    직관적인 드래그 앤 드롭 인터페이스
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    완전한 자유도로 세밀한 조정 가능
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    실시간 지도 기반 경로 시각화
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex items-center gap-2 text-gray-700 font-semibold group-hover:gap-3 transition-all">
                  <span>시작하기</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 하단 안내 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            이미 만든 여행 계획이 있으신가요?{" "}
            <Link
              href="/my-planner"
              className="text-blue-500 hover:text-blue-600 font-medium hover:underline"
            >
              내 일정 보러가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
    if (loading) return; // 로딩 중이면 아무것도 하지 않음

    if (!user) {
      const redirectPath = encodeURIComponent("/planner");
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [user, loading, router]);

  // 인증 로딩 중
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50">
        {/* 제목 스켈레톤 */}
        <div className="mb-4 space-y-3 w-full max-w-2xl px-8">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 설명 스켈레톤 */}
        <div className="mb-12 space-y-2 w-full max-w-2xl px-8">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>

        {/* 카드 스켈레톤 */}
        <div className="flex gap-8 w-full max-w-4xl px-8">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex-1 p-8 bg-white border border-gray-200 rounded-lg"
            >
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">
        어떤 여행을 계획하고 싶으신가요?
      </h1>
      <p className="text-gray-600 mb-12">
        두 가지 방법으로 당신만의 완벽한 여행을 만들 수 있습니다.
      </p>

      <div className="flex gap-8 w-full max-w-4xl px-8">
        {/* AI로 계획 짜기 */}
        <Link href="/planner/ai" className="flex-1">
          <div className="p-8 h-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-all">
            <h2 className="text-2xl font-semibold mb-2">
              AI로 똑똑하게 여행 계획 짜기 🤖
            </h2>
            <p className="text-gray-500">
              몇 가지 질문에 답하면, AI가 당신의 취향에 꼭 맞는 여행 코스를
              추천해 드립니다.
            </p>
          </div>
        </Link>

        {/* 직접 계획 짜기 */}
        <Link href="/planner/new" className="flex-1">
          <div className="p-8 h-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-all">
            <h2 className="text-2xl font-semibold mb-2">
              처음부터 직접 여행 계획 짜기 ✏️
            </h2>
            <p className="text-gray-500">
              가고 싶은 곳들을 자유롭게 담아 나만의 여행 일정을 직접 만들어
              보세요.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

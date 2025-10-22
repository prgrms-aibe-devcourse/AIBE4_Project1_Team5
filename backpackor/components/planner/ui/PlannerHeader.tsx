// 플래너 헤더 컴포넌트
"use client";

import { useRouter } from "next/navigation";

interface PlannerHeaderProps {
  isEditMode: boolean;
}

export const PlannerHeader = ({ isEditMode }: PlannerHeaderProps) => {
  const router = useRouter();

  return (
    <div className="mb-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="font-medium">뒤로가기</span>
      </button>

      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {isEditMode ? "여행 일정 수정" : "나만의 여행 만들기"}
      </h1>
      <p className="text-lg text-gray-600">
        원하는 장소를 추가하고 나만의 여행 일정을 계획해보세요
      </p>
    </div>
  );
};

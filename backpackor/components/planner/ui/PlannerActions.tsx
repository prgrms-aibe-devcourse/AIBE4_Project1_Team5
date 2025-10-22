// 플래너 액션 버튼 컴포넌트
"use client";

import { useRouter } from "next/navigation";

interface PlannerActionsProps {
  isSaving: boolean;
  onPreview: () => void;
}

export const PlannerActions = ({ isSaving, onPreview }: PlannerActionsProps) => {
  const router = useRouter();

  return (
    <div className="mt-8 flex justify-end gap-3 pb-8">
      <button
        onClick={() => router.back()}
        className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
      >
        취소
      </button>
      <button
        onClick={onPreview}
        disabled={isSaving}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>처리 중...</span>
          </>
        ) : (
          <>
            <span>일정 미리보기</span>
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
          </>
        )}
      </button>
    </div>
  );
};

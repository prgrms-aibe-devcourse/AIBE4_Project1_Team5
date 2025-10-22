// app/review/write/page.tsx
"use client";

import ReviewForm from "@/components/review/ReviewForm";
import TripDetailReviewForm from "@/components/review/TripDetailReviewForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * 통합된 리뷰 작성/수정 페이지
 *
 * 사용 케이스:
 * 1. /review/write?placeId=xxx&placeName=xxx → 특정 여행지 리뷰 작성 (TripDetailReviewForm)
 * 2. /review/write?edit=xxx → 리뷰 수정 (TripDetailReviewForm)
 * 3. /review/write → 일반 리뷰 작성 (ReviewForm)
 */
function ReviewWriteContent() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId");
  const placeName = searchParams.get("placeName");
  const editId = searchParams.get("edit");

  // placeId나 editId가 있으면 TripDetailReviewForm 사용
  if (placeId || editId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TripDetailReviewForm editId={editId} />
      </div>
    );
  }

  // 기본: ReviewForm 사용 (여행지 선택 가능)
  return <ReviewForm />;
}

export default function ReviewWritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ReviewWriteContent />
    </Suspense>
  );
}

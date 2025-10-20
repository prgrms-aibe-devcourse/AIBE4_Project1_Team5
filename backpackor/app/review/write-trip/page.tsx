// app/review/write-trip/page.tsx
"use client";

import DetailReviewForm from "@/component/review/TripDetailReviewForm";
import { useSearchParams } from "next/navigation";

export default function WriteTripReviewPage() {
  // URL 쿼리 파라미터에서 edit(리뷰 ID) 값 가져오기
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* editId를 DetailReviewForm에 prop으로 전달 */}
      <DetailReviewForm editId={editId} />
    </div>
  );
}

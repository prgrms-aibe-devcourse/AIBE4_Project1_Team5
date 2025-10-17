"use client";

import type { Review } from "@/type/travel";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ReviewWithProfile extends Review {
  profiles: {
    display_name: string;
  } | null;
}

interface TravelReviewSectionProps {
  placeId: string;
  averageRating: number;
  reviewCount: number;
  showReviewButton?: boolean;
  placeName?: string;
}

const MOCK_REVIEWS_DATA: ReviewWithProfile[] = [
  {
    review_id: "r1",
    place_id: "jeju-mock-id",
    user_id: "u1234",
    review_title: "완벽했어요!",
    review_content:
      "한라산 등반도 하고, 공기도 맑아서 스트레스가 풀리는 느낌이었어요.",
    rating: 5,
    helpful_count: 3,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: null,
    is_public: true,
    profiles: { display_name: "여행자123" },
  },
  {
    review_id: "r2",
    place_id: "jeju-mock-id",
    user_id: "u5678",
    review_title: "너무 좋아요",
    review_content: "바다도 보고, 제주도는 언제나 감동을 주는 곳이에요!",
    rating: 4,
    helpful_count: 1,
    created_at: "2024-01-13T10:00:00Z",
    updated_at: null,
    is_public: true,
    profiles: { display_name: "제주러버나야" },
  },
];

const TravelReviewSection: React.FC<TravelReviewSectionProps> = ({
  placeId,
  averageRating,
  reviewCount,
  showReviewButton = false,
  placeName = "",
}) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // DB 연동 예정
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (placeId === "jeju-mock-id") {
          setReviews(MOCK_REVIEWS_DATA);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("리뷰 로드 실패 (목업 사용):", err);

        if (placeId === "jeju-mock-id") {
          setReviews(MOCK_REVIEWS_DATA);
        } else {
          setReviews([]);
        }
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [placeId]);

  if (loading) return <div className="p-5">리뷰 로딩 중...</div>;
  if (error) return <div className="p-5 text-red-600">오류: {error}</div>;

  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          여행지 리뷰 ({reviewCount}개)
        </h2>
        <span className="text-lg font-semibold text-yellow-500">
          ⭐ {averageRating.toFixed(1)}
        </span>
      </div>

      {/* 리뷰 작성 버튼 */}
      {showReviewButton && (
        <button
          onClick={() =>
            router.push(
              `/review/write?placeId=${placeId}&placeName=${encodeURIComponent(
                placeName
              )}`
            )
          }
          className="group relative w-full mb-6 overflow-hidden rounded-lg border border-gray-900 bg-white px-6 py-3 transition-all hover:border-gray-700"
        >
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-700">
              이 장소 리뷰 작성하기
            </span>
            <svg
              className="h-4 w-4 text-gray-900 transition-all group-hover:translate-x-1 group-hover:text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            아직 작성된 리뷰가 없습니다.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.review_id}
              className="border-b border-gray-100 pb-4 last:border-b-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  {review.profiles?.display_name || "익명 사용자"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.review_content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelReviewSection;

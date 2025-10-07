"use client"; // ⭐️ 1. 클라이언트 컴포넌트임을 명시함 ⭐️

import React, { useEffect, useState } from "react";
// 🚨 팀 프로젝트에 맞게 경로를 수정해야 합니다.
// Supabase 클라이언트와 타입 정의 경로를 팀 프로젝트 구조에 맞게 변경합니다.
// import { supabase } from "@/lib/supabase/client"; // 실제 Supabase 경로로 변경 필요
import type { Review } from "@/lib/types/travel"; // 타입 경로 변경 가정

// ----------------------------------------------------
// ⭐️ 인터페이스 및 상수 유지 (App Router 환경에 맞춰 임포트 경로만 수정) ⭐️
// ----------------------------------------------------
interface ReviewWithProfile extends Review {
  profiles: {
    display_name: string; // user 테이블의 닉네임 컬럼명으로 가정함
  } | null;
}

interface TravelReviewSectionProps {
  placeId: string;
  averageRating: number;
  reviewCount: number;
}

const MOCK_REVIEWS_DATA: ReviewWithProfile[] = [
  // ... (목업 데이터 내용 유지) ...
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
}) => {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐️ 로직 변경 없음: 'use client'가 있으므로 기존 로직을 그대로 사용함 ⭐️
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // ... (DB 연동 예정 코드 주석 유지) ...

        // ⭐️ 현재 목업 데이터 사용 (DB 없을 때 작동 보장) ⭐️
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

  if (loading) return <div>리뷰 로딩 중임...</div>;
  if (error) return <div style={{ color: "red" }}>오류: {error}</div>;

  // 💻 UI 렌더링 (JSX 유지)
  return (
    <div
      className="travel-review-section"
      style={{ padding: "20px", borderTop: "1px solid #ccc" }}
    >
      <h2>
        여행지 리뷰 ({reviewCount}개)
        <span
          style={{ marginLeft: "10px", fontSize: "18px", color: "#ffc107" }}
        >
          ⭐️ {averageRating.toFixed(1)}
        </span>
      </h2>

      <div className="review-list">
        {reviews.length === 0 ? (
          <p style={{ color: "#999" }}>아직 작성된 리뷰가 없음.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.review_id}
              style={{ borderBottom: "1px dashed #eee", padding: "15px 0" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <strong style={{ fontWeight: 600 }}>
                  👤 {review.profiles?.display_name || "익명 사용자"}
                </strong>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ margin: "5px 0" }}>{review.review_content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelReviewSection;

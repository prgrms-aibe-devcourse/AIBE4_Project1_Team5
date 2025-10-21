// component/review/ReviewList.tsx
"use client";

import type { Review } from "@/types/travel";
import React, { useState } from "react";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const [visibleCount, setVisibleCount] = useState(4);

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, reviews.length));
  };

  if (reviews.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#6b7280",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <p style={{ fontSize: "16px", margin: 0 }}>
          아직 작성된 리뷰가 없습니다.
        </p>
        <p style={{ fontSize: "14px", marginTop: "8px", color: "#9ca3af" }}>
          첫 번째 리뷰를 작성해보세요!
        </p>
      </div>
    );
  }

  const allLoaded = visibleCount >= reviews.length;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {reviews.slice(0, visibleCount).map((review) => (
          <ReviewCard key={review.review_id} review={review} />
        ))}
      </div>

      <div style={{ marginTop: "24px", width: "200px", marginLeft: "auto" }}>
        {!allLoaded ? (
          <button
            onClick={showMore}
            style={{
              width: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3b82f6")
            }
          >
            리뷰 더보기
          </button>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            더 이상 표시할 리뷰가 없습니다.
          </p>
        )}
      </div>
    </>
  );
};

export default ReviewList;

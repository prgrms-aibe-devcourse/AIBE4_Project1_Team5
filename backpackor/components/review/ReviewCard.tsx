// component/review/ReviewCard.tsx
"use client";

import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabaseClient";
import type { Review } from "@/types/travel";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const getLoggedInUserId = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? user.id : null;
};

const checkIfUserLikedReview = async (
  userId: string,
  reviewId: string
): Promise<boolean> => {
  const { count } = await supabase
    .from("user_helpful_review")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("review_id", reviewId);

  return (count || 0) > 0;
};

const toggleHelpful = async (
  userId: string,
  reviewId: string,
  isCurrentlyHelpful: boolean
) => {
  try {
    if (!isCurrentlyHelpful) {
      const { error: insertError } = await supabase
        .from("user_helpful_review")
        .insert([{ user_id: userId, review_id: reviewId }]);

      if (insertError && insertError.code !== "23505") throw insertError;

      const { data: currentReview, error: selectError } = await supabase
        .from("review")
        .select("helpful_count")
        .eq("review_id", reviewId)
        .single();

      if (selectError) throw selectError;

      const newCount = (currentReview.helpful_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("review")
        .update({ helpful_count: newCount })
        .eq("review_id", reviewId);

      if (updateError) throw updateError;

      return newCount;
    } else {
      const { error: deleteError } = await supabase
        .from("user_helpful_review")
        .delete()
        .eq("user_id", userId)
        .eq("review_id", reviewId);

      if (deleteError) throw deleteError;

      const { data: currentReview, error: selectError } = await supabase
        .from("review")
        .select("helpful_count")
        .eq("review_id", reviewId)
        .single();

      if (selectError) throw selectError;

      const newCount = Math.max(0, (currentReview.helpful_count || 0) - 1);

      const { error: updateError } = await supabase
        .from("review")
        .update({ helpful_count: newCount })
        .eq("review_id", reviewId);

      if (updateError) throw updateError;

      return newCount;
    }
  } catch (error) {
    console.error("도움돼요 토글 실패:", error);
    throw new Error("처리 중 오류가 발생했습니다.");
  }
};

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const router = useRouter();

  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 작성자 프로필 정보 가져오기
  const { profile: authorProfile } = useProfile(review.user_id);

  useEffect(() => {
    const checkStatus = async () => {
      const currentUserId = await getLoggedInUserId();
      setUserId(currentUserId);

      if (currentUserId) {
        const liked = await checkIfUserLikedReview(
          currentUserId,
          review.review_id
        );
        setIsHelpful(liked);
      }
      setIsLoading(false);
    };
    checkStatus();
  }, [review.review_id]);

  const handleToggleHelpful = async () => {
    if (isLoading) return;

    if (!userId) {
      alert("이 리뷰가 도움이 되었나요? 로그인 후 이용해주세요.");
      router.push(`/login?redirectTo=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);
    try {
      const newCount = await toggleHelpful(userId, review.review_id, isHelpful);

      setIsHelpful((prev) => !prev);
      setHelpfulCount(newCount);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = isHelpful
    ? `도움됨 (${helpfulCount})`
    : `도움돼요 (${helpfulCount})`;
  const buttonClassName = `helpful-button ${isHelpful ? "helpful-active" : ""}`;

  // 작성자 닉네임 표시 (프로필이 없거나 display_name이 없으면 "익명 사용자")
  const authorNickname = authorProfile?.display_name || "익명 사용자";

  return (
    <div className="review-card">
      <div className="review-content-placeholder">
        <h3>{review.review_title}</h3>
        <p>{review.review_content.substring(0, 100)}...</p>
        <div className="review-meta">
          <span className="author-info">작성자: {authorNickname}</span> |
          <span>⭐ {review.rating}</span> |
          <span>
            작성일: {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="helpful-container">
        <button
          onClick={handleToggleHelpful}
          className={buttonClassName}
          disabled={isLoading}
        >
          {isHelpful ? "👍" : "🤍"} {buttonText}
        </button>
      </div>

      <style jsx>{`
        .review-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .review-content-placeholder h3 {
          font-size: 18px;
          margin-top: 0;
        }
        .review-meta {
          font-size: 14px;
          color: #6b7280;
        }
        .author-info {
          font-weight: 500;
          color: #374151;
        }
        .helpful-container {
          text-align: right;
        }
        .helpful-button {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 20px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
          justify-content: center;
          margin-left: auto;
          border: 1px solid #d1d5db;
          color: #4b5563;
          background: #f9fafb;
        }
        .helpful-button:hover:not(:disabled) {
          background: #e5e7eb;
        }
        .helpful-active {
          background: #dbeafe;
          color: #1e40af;
          border-color: #3b82f6;
        }
        .helpful-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ReviewCard;

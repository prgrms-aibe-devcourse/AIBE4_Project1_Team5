// 리뷰 상세 페이지 데이터 fetching 훅
import { useState, useEffect } from "react";
import { getReviewById } from "@/apis/reviewApi";
import { getPlaceInfo } from "@/apis/placeApi";
import type { ReviewWithImages } from "@/types/review";
import type { PlaceInfo } from "@/types/place";

interface UseReviewDetailReturn {
  review: ReviewWithImages | null;
  placeInfo: PlaceInfo | null;
  isLoading: boolean;
}

export const useReviewDetail = (reviewId: string): UseReviewDetailReturn => {
  const [review, setReview] = useState<ReviewWithImages | null>(null);
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      setIsLoading(true);

      const reviewData = await getReviewById(reviewId);
      setReview(reviewData);

      setIsLoading(false);
    };

    fetchReviewData();
  }, [reviewId]);

  useEffect(() => {
    const fetchPlaceData = async () => {
      if (!review?.place_id) return;

      const placeData = await getPlaceInfo(review.place_id);
      setPlaceInfo(placeData);
    };

    fetchPlaceData();
  }, [review]);

  return { review, placeInfo, isLoading };
};
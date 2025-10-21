"use client";

import PlaceDetailModal from "@/components/place/PlaceDetailModal";
import ImageModal from "@/components/review/ImageModal";
import { ReviewActionButtons } from "@/components/review/ReviewButton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  getReviewById,
  type ReviewWithImages,
} from "@/lib/reviewStoreSupabase";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [review, setReview] = useState<ReviewWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeName, setPlaceName] = useState<string>("");
  const [placeAddress, setPlaceAddress] = useState<string>("");
  const [placeImage, setPlaceImage] = useState<string>("");

  // place 모달 상태
  const [placeModalOpen, setPlaceModalOpen] = useState(false);

  // 작성자 프로필 정보 가져오기
  const { profile: authorProfile } = useProfile(review?.user_id);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  // 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);
      const data = await getReviewById(id);
      setReview(data);

      setIsLoading(false);
    };

    fetchReview();
  }, [id]);

  // 여행지 정보 가져오기
  useEffect(() => {
    const fetchPlaceInfo = async () => {
      if (review && review.place_id) {
        const { data, error } = await supabase
          .from("place")
          .select("place_name, place_address, place_image")
          .eq("place_id", review.place_id)
          .single();

        if (!error && data) {
          setPlaceName(data.place_name);
          setPlaceAddress(data.place_address || "");
          setPlaceImage(data.place_image || "");
        }
      }
    };

    fetchPlaceInfo();
  }, [review]);

  // 이미지 클릭 핸들러
  const handleImageClick = (index: number) => {
    if (review && review.images.length > 0) {
      setModalImages(review.images.map((img) => img.review_image));
      setModalIndex(index);
      setModalOpen(true);
    }
  };

  // 모달 네비게이션
  const handleModalNext = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = () => {
    setModalIndex(
      (prev) => (prev - 1 + modalImages.length) % modalImages.length
    );
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-2xl ${
            i <= roundedRating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 삭제 후 콜백
  const handleDeleteCallback = () => {
    router.push("/review");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500 mb-4">리뷰를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push("/review")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        {/* 헤더 네비게이션 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>뒤로 가기</span>
          </button>
        </div>

        {/* 메인 콘텐츠 카드 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 헤더 섹션 */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
                  {review.region}
                </span>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {review.review_title}
                </h1>

                {/* 여행지 카드 (클릭 시 모달 열기) */}
                {placeName && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPlaceModalOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setPlaceModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex items-center gap-4">
                      {placeImage && (
                        <img
                          src={placeImage}
                          alt={placeName}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <h3 className="text-2xl font-bold text-gray-900 truncate">
                            {placeName}
                          </h3>
                        </div>
                        {placeAddress && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {placeAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 별점 */}
                <div className="flex items-center gap-3">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-xl font-semibold text-gray-800">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 본인 리뷰인 경우 수정/삭제 버튼 */}
              {user && user.id === review.user_id && (
                <ReviewActionButtons
                  reviewId={review.review_id}
                  onDelete={handleDeleteCallback}
                />
              )}
            </div>

            {/* 작성 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{authorProfile?.display_name || "익명 사용자"}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatDate(review.created_at)}</span>
              </div>
              {review.updated_at && review.updated_at !== review.created_at && (
                <>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2 text-orange-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>수정됨: {formatDate(review.updated_at)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* 리뷰 내용 */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                {review.review_content}
              </p>
            </div>
          </div>
          {/* 이미지 갤러리 */}
          {review.images.length > 0 && (
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">사진</h2>
                <span className="text-sm text-gray-500">
                  {review.images.length}장
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {review.images.map((image, index) => (
                  <div
                    key={image.review_image_id}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image.review_image}
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" /> */}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 하단 버튼 */}
          <div className="p-8 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/review")}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                목록으로
              </button>
              {user && user.id === review.user_id && (
                <button
                  onClick={() =>
                    router.push(`/review/write?edit=${review.review_id}`)
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  수정하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {modalOpen && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={() => setModalOpen(false)}
          onNext={handleModalNext}
          onPrev={handleModalPrev}
        />
      )}

      {/* 여행지 상세 모달 */}
      {placeModalOpen && review?.place_id && (
        <PlaceDetailModal
          placeId={review.place_id}
          onClose={() => setPlaceModalOpen(false)}
          showReviewButton={true}
        />
      )}
    </div>
  );
}

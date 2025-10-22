"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import ImageModal from "@/components/review/ImageModal";
import { BackButton } from "@/components/review/detail/BackButton";
import { ReviewDetailHeader } from "@/components/review/detail/ReviewDetailHeader";
import { ReviewContent } from "@/components/review/detail/ReviewContent";
import { ReviewImageGallery } from "@/components/review/detail/ReviewImageGallery";
import { ReviewActionBar } from "@/components/review/detail/ReviewActionBar";
import { HelpfulButton } from "@/components/review/HelpfulButton";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/auth/useProfile";
import { useReviewDetail } from "@/hooks/review/useReviewDetail";
import { useImageModal } from "@/hooks/review/useImageModal";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // 리뷰 데이터 fetching
  const { review, placeInfo, isLoading } = useReviewDetail(id);

  // 작성자 프로필 정보
  const {
    profile: authorProfile,
    profileUrl: authorProfileUrl,
    isLoading: isProfileLoading,
  } = useProfile(review?.user_id);

  // 모달 상태 관리
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const {
    modalOpen,
    modalImages,
    modalIndex,
    openModal,
    closeModal,
    nextImage,
    prevImage,
  } = useImageModal();

  // 이벤트 핸들러
  const handleImageClick = (index: number) => {
    if (!review || review.images.length === 0) return;

    const imageUrls = review.images.map((img) => img.review_image);
    openModal(imageUrls, index);
  };

  const handleDeleteCallback = () => {
    router.push("/review");
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleListClick = () => {
    router.push("/review");
  };

  const handleEditClick = () => {
    router.push(`/review/write?edit=${review?.review_id}`);
  };

  // Early return: 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // Early return: 리뷰를 찾을 수 없음
  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500 mb-4">리뷰를 찾을 수 없습니다.</p>
        <button
          onClick={handleListClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          전체 리뷰
        </button>
      </div>
    );
  }

  const isAuthor = user?.id === review.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <BackButton onClick={handleBackClick} />

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <ReviewDetailHeader
            review={review}
            placeInfo={placeInfo}
            authorProfile={authorProfile}
            authorProfileUrl={authorProfileUrl}
            isProfileLoading={isProfileLoading}
            currentUserId={user?.id}
            onPlaceClick={() => setPlaceModalOpen(true)}
            onDelete={handleDeleteCallback}
          />

          <ReviewContent content={review.review_content} />

          <ReviewImageGallery
            images={review.images}
            onImageClick={handleImageClick}
          />

          {/* 도움됨 버튼 */}
          <div className="px-8 pb-6">
            <HelpfulButton
              reviewId={review.review_id}
              initialHelpfulCount={review.helpful_count || 0}
            />
          </div>

          <ReviewActionBar
            reviewId={review.review_id}
            isAuthor={isAuthor}
            onListClick={handleListClick}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      {/* 이미지 모달 */}
      {modalOpen && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

      {/* 여행지 상세 모달 */}
      {placeModalOpen && review.place_id && (
        <PlaceDetailModal
          placeId={review.place_id}
          onClose={() => setPlaceModalOpen(false)}
          showReviewButton={true}
        />
      )}
    </div>
  );
}
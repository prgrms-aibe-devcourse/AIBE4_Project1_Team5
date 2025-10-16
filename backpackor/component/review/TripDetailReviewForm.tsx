"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  saveReview,
  uploadImage,
  saveReviewImages,
  getRegions,
} from "@/lib/reviewStoreSupabase";
import { useProfile } from "@/hook/useProfile";
import ImageModal from "./ImageModal";

interface PlaceReview {
  placeId: string;
  placeName: string;
  region: string;
  title: string;
  content: string;
  rating: number;
  imageFiles: File[];
  imagePreviews: string[];
}

export default function DetailReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 데이터 추출
  const placeIds = searchParams.get('placeIds')?.split(',') || [];
  const placeNames = searchParams.get('placeNames')?.split(',') || [];
  const tripTitle = searchParams.get('tripTitle') || '';

  // 상태 관리
  const [userId, setUserId] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  // 프로필 훅 사용
  const { profile } = useProfile(userId);

  // 초기화
  useEffect(() => {
    const initializeData = async () => {
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

      // 지역 목록 가져오기
      const regionList = await getRegions();
      setRegions(regionList);

      // 리뷰 폼 초기화
      const initialReviews = placeIds.map((placeId, index) => ({
        placeId,
        placeName: placeNames[index] || '',
        region: '',
        title: '',
        content: '',
        rating: 0,
        imageFiles: [],
        imagePreviews: []
      }));
      setReviews(initialReviews);
    };

    initializeData();
  }, []);

  // 리뷰 데이터 업데이트
  const updateReview = (index: number, field: keyof PlaceReview, value: any) => {
    setReviews(prev => prev.map((review, i) => 
      i === index ? { ...review, [field]: value } : review
    ));
  };

  // 별점 클릭 핸들러
  const handleStarClick = (reviewIndex: number, rating: number) => {
    updateReview(reviewIndex, 'rating', rating);
  };

  // 별점 렌더링
  const renderStars = (reviewIndex: number, currentRating: number) => {
    return [1, 2, 3, 4, 5].map(position => (
      <button
        key={position}
        type="button"
        onClick={() => handleStarClick(reviewIndex, position)}
        className={`text-3xl cursor-pointer focus:outline-none transition-all hover:scale-110 ${
          position <= currentRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ));
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (reviewIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentReview = reviews[reviewIndex];
    
    if (currentReview.imageFiles.length + files.length > 5) {
      alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
      return;
    }

    const newImageFiles = [...currentReview.imageFiles, ...files];
    updateReview(reviewIndex, 'imageFiles', newImageFiles);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviews(prev => prev.map((review, i) => 
          i === reviewIndex 
            ? { ...review, imagePreviews: [...review.imagePreviews, reader.result as string] }
            : review
        ));
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (reviewIndex: number, imageIndex: number) => {
    const currentReview = reviews[reviewIndex];
    const newImageFiles = currentReview.imageFiles.filter((_, i) => i !== imageIndex);
    const newImagePreviews = currentReview.imagePreviews.filter((_, i) => i !== imageIndex);
    
    updateReview(reviewIndex, 'imageFiles', newImageFiles);
    updateReview(reviewIndex, 'imagePreviews', newImagePreviews);
  };

  // 이미지 클릭 핸들러 (모달)
  const handleImageClick = (images: string[], index: number) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  // 모달 네비게이션
  const handleModalNext = () => {
    setModalIndex(prev => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = () => {
    setModalIndex(prev => (prev - 1 + modalImages.length) % modalImages.length);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      if (!review.region.trim()) {
        alert(`${review.placeName}의 지역을 선택해주세요.`);
        return;
      }
      if (!review.title.trim()) {
        alert(`${review.placeName}의 제목을 입력해주세요.`);
        return;
      }
      if (!review.content.trim()) {
        alert(`${review.placeName}의 내용을 입력해주세요.`);
        return;
      }
      if (review.rating === 0) {
        alert(`${review.placeName}의 별점을 선택해주세요.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let successCount = 0;
      
      // 각 여행지별로 리뷰 저장
      for (const review of reviews) {
        // 리뷰 데이터 저장 (place_id는 실제 여행지 ID 사용)
        const savedReview = await saveReview({
          place_id: review.placeId, // 실제 여행지 ID 사용
          user_id: userId,
          region: review.region,
          review_title: review.title,
          review_content: review.content,
          rating: review.rating,
        });

        if (!savedReview) {
          console.error(`${review.placeName} 리뷰 저장 실패`);
          alert(`${review.placeName} 리뷰 저장에 실패했습니다.`);
          continue; // 다음 리뷰 계속 처리
        }

        // 이미지 업로드 및 저장
        if (review.imageFiles.length > 0) {
          const uploadedUrls: string[] = [];

          // 각 이미지 파일을 Storage에 업로드
          for (const file of review.imageFiles) {
            try {
              const url = await uploadImage(file, savedReview.review_id);
              if (url) {
                uploadedUrls.push(url);
              } else {
                console.error(`${review.placeName}의 이미지 업로드 실패:`, file.name);
              }
            } catch (error) {
              console.error(`${review.placeName}의 이미지 업로드 오류:`, error);
            }
          }

          // 업로드된 이미지 URL들을 DB에 저장
          if (uploadedUrls.length > 0) {
            const success = await saveReviewImages(savedReview.review_id, uploadedUrls);
            if (!success) {
              console.error(`${review.placeName} 이미지 DB 저장 실패`);
            }
          }
        }

        successCount++;
      }

      // 결과 알림
      if (successCount === reviews.length) {
        alert("모든 리뷰가 성공적으로 작성되었습니다.");
        router.push("/review");
      } else if (successCount > 0) {
        alert(`${successCount}/${reviews.length}개의 리뷰가 작성되었습니다. 일부 리뷰 작성에 실패했습니다.`);
        router.push("/review");
      } else {
        alert("모든 리뷰 작성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("리뷰 제출 전체 오류:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">여행 리뷰 작성</h1>
        <p className="text-lg text-gray-600">"{tripTitle}" 여행의 리뷰를 작성해주세요</p>
        <p className="text-sm text-gray-500 mt-1">선택된 {reviews.length}개 여행지</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 닉네임 정보 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={profile?.display_name || "사용자"}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-not-allowed"
          />
        </div>

        {/* 각 여행지별 리뷰 폼 */}
        {reviews.map((review, reviewIndex) => (
          <div key={review.placeId} className="border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-6 text-blue-600">
              {review.placeName} 리뷰
            </h2>

            <div className="space-y-6">
              {/* 지역 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역 <span className="text-red-500">*</span>
                </label>
                <select
                  value={review.region}
                  onChange={(e) => updateReview(reviewIndex, 'region', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">지역을 선택하세요</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={review.title}
                  onChange={(e) => updateReview(reviewIndex, 'title', e.target.value)}
                  placeholder="리뷰 제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              {/* 별점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  별점 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {renderStars(reviewIndex, review.rating)}
                  {review.rating > 0 && (
                    <span className="ml-4 text-xl font-bold text-gray-800">
                      {review.rating}점
                    </span>
                  )}
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={review.content}
                  onChange={(e) => updateReview(reviewIndex, 'content', e.target.value)}
                  placeholder="리뷰 내용을 입력하세요"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 (최대 5개)
                </label>

                {/* 이미지 미리보기 */}
                {review.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {review.imagePreviews.map((preview, imageIndex) => (
                      <div key={imageIndex} className="relative group">
                        <img
                          src={preview}
                          alt={`미리보기 ${imageIndex + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(review.imagePreviews, imageIndex)}
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(reviewIndex, imageIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 이미지 추가 버튼 */}
                {review.imageFiles.length < 5 && (
                  <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <span>이미지 추가</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageSelect(reviewIndex, e)}
                      className="hidden"
                    />
                  </label>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  현재: {review.imageFiles.length} / 5
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 제출 버튼 */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-200 py-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "리뷰 작성 중..." : `${reviews.length}개 리뷰 모두 작성하기`}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
        </div>
      </form>

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
    </div>
  );
}
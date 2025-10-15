// component/review/ReviewForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  saveReview,
  updateReview,
  uploadImage,
  saveReviewImages,
  getReviewById,
  deleteReviewImage,
  getRegions,
} from "@/lib/reviewStoreSupabase";
import ImageModal from "./ImageModal";

interface ReviewFormProps {
  reviewId?: string;
  placeId?: string;
}

export default function ReviewForm({ reviewId, placeId }: ReviewFormProps) {
  const router = useRouter();

  // 폼 상태
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [regions, setRegions] = useState<string[]>([]); // 지역 목록
  const [selectedRegion, setSelectedRegion] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // 이미지 관련 상태
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string }>
  >([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    };
    fetchUserInfo();
  }, []);

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(regionList);
    };
    
    fetchRegions();
  }, []);

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(regionList);
    };
    
    fetchRegions();
  }, []);

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(regionList);
    };
    
    fetchRegions();
  }, []);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (reviewId) {
      const fetchReview = async () => {
        setIsLoading(true);
        const review = await getReviewById(reviewId);

        if (review) {
          setSelectedRegion(review.region);
          setTitle(review.review_title);
          setContent(review.review_content);
          setRating(Math.round(review.rating)); // 정수로 변환

          const images = review.images.map((img) => ({
            id: img.review_image_id,
            url: img.review_image,
          }));
          setExistingImages(images);
        }

        setIsLoading(false);
      };

      fetchReview();
    }
  }, [reviewId]);

  // 이미지 클릭 핸들러
  const handleImageClick = (images: string[], index: number) => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  // 모달 네비게이션
  const handleModalNext = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = () => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  // 새 이미지 파일 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const totalImages =
      existingImages.length + newImageFiles.length + files.length;

    if (totalImages > 5) {
      alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
      return;
    }

    setNewImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = async (
    imageId: number,
    imageUrl: string
  ) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    const success = await deleteReviewImage(imageId, imageUrl);
    if (success) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  // 새 이미지 삭제
  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 별 클릭 (정수 단위)
  const handleStarClick = (position: number) => {
    setRating(position);
  };

  // 별 호버 (정수 단위)
  const handleStarHover = (position: number) => {
    setHoveredRating(position);
  };

  // 별 렌더링 (정수 단위)
  const renderStar = (position: number, currentRating: number) => {
    const isFilled = position <= currentRating;

    return (
      <button
        key={position}
        type="button"
        onClick={() => handleStarClick(position)}
        onMouseEnter={() => handleStarHover(position)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`text-5xl cursor-pointer focus:outline-none transition-all hover:scale-110 ${
          isFilled ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    );
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!selectedRegion.trim()) {
      alert("지역을 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (reviewId) {
        // 수정 모드
        const updated = await updateReview(reviewId, {
          region: selectedRegion,
          review_title: title,
          review_content: content,
          rating: rating,
        });

        if (!updated) {
          alert("리뷰 수정에 실패했습니다.");
          setIsSubmitting(false);
          return;
        }

        // 새 이미지 업로드
        if (newImageFiles.length > 0) {
          const uploadedUrls: string[] = [];

          for (const file of newImageFiles) {
            const url = await uploadImage(file, reviewId);
            if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
            const success = await saveReviewImages(reviewId, uploadedUrls);
            if (!success) {
              console.error("이미지 DB 저장 실패");
            }
          }
        }

        alert("리뷰가 수정되었습니다.");
        router.push(`/review/${reviewId}`);
      } else {
        // 작성 모드
        const uuid = crypto.randomUUID();

        const savedReview = await saveReview({
          place_id: uuid,
          user_id: userId,
          region: selectedRegion,
          review_title: title,
          review_content: content,
          rating: rating,
        });
        
        if (!savedReview) {
          alert("리뷰 저장에 실패했습니다.");
          setIsSubmitting(false);
          return;
        }

        // 이미지 업로드
        if (newImageFiles.length > 0) {
          const uploadedUrls: string[] = [];

          for (const file of newImageFiles) {
            const url = await uploadImage(file, savedReview.review_id);
            if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
            const success = await saveReviewImages(
              savedReview.review_id,
              uploadedUrls
            );
            if (!success) {
              console.error("이미지 DB 저장 실패");
            }
          }
        }

        alert("리뷰가 작성되었습니다.");
        router.push("/review");
      }
    } catch (error) {
      console.error("리뷰 제출 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {reviewId ? "리뷰 수정" : "리뷰 작성"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 작성자 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작성자
          </label>
          <input
            type="text"
            value={userEmail}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* 지역 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지역 <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!reviewId}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="리뷰 제목을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        {/* 별점 (정수 단위) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            별점 <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((position) =>
              renderStar(position, hoveredRating || rating)
            )}

            {rating > 0 && (
              <span className="ml-4 text-2xl font-bold text-gray-800">
                {rating}점
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2">
            별을 클릭하여 1~5점 사이의 점수를 선택하세요
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰 내용을 입력하세요"
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 (최대 5개)
          </label>

          {/* 기존 이미지 (수정 모드) */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">기존 이미지</p>
              <div className="grid grid-cols-5 gap-2">
                {existingImages.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="기존 이미지"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(existingImages.map(i => i.url), index)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id, img.url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 이미지 미리보기 */}
          {newImagePreviews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">새 이미지</p>
              <div className="grid grid-cols-5 gap-2">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`미리 보기 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(newImagePreviews, index)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 이미지 추가 버튼 */}
          {existingImages.length + newImageFiles.length < 5 && (
            <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              <span>이미지 추가</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          <p className="text-sm text-gray-500 mt-2">
            현재: {existingImages.length + newImageFiles.length} / 5
          </p>
          <p className="text-xs text-gray-400 mt-1">
            지원 형식: JPG, PNG, GIF, WebP, AVIF, SVG 등 모든 이미지 형식
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "처리 중..." : reviewId ? "수정하기" : "작성하기"}
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
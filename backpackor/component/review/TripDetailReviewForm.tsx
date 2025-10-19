// app/review/write-place/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  saveReview,
  uploadImage,
  saveReviewImages,
  getRegions,
} from "@/lib/reviewStoreSupabase";
import { useProfile } from "@/hook/useProfile";
import ImageModal from "@/component/review/ImageModal";

export default function PlaceReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL에서 여행지 정보 추출
  const placeId = searchParams.get('placeId');
  const placeName = searchParams.get('placeName');

  const [userId, setUserId] = useState<string>("");
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  const { profile } = useProfile(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기화
  useEffect(() => {
    if (!placeId || !placeName) {
      alert("잘못된 접근입니다.");
      router.push("/review");
      return;
    }

    const initializeData = async () => {
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

      // 지역 목록 가져오기
      const regionList = await getRegions();
      setRegions(regionList);
    };

    initializeData();
  }, [placeId, placeName, router]);

  // 별점 클릭 핸들러
  const handleStarClick = (rating: number) => {
    setRating(rating);
  };

  // 별점 렌더링
  const renderStars = (currentRating: number) => {
    return [1, 2, 3, 4, 5].map(position => (
      <button
        key={position}
        type="button"
        onClick={() => handleStarClick(position)}
        onMouseEnter={() => setHoveredRating(position)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`text-5xl cursor-pointer focus:outline-none transition-all hover:scale-110 ${
          position <= (hoveredRating || currentRating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ));
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (imageFiles.length + files.length > 5) {
      alert("이미지는 최대 5개까지 업로드할 수 있습니다.");
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 이미지 클릭 핸들러 (모달)
  const handleImageClick = (index: number) => {
    setModalImages(imagePreviews);
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

    if (!userId) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
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
      // 리뷰 저장
      const savedReview = await saveReview({
        place_id: placeId!,
        user_id: userId,
        region: selectedRegion,
        review_title: title,
        review_content: content,
        rating: rating,
      });

      if (!savedReview) {
        throw new Error("리뷰 저장에 실패했습니다.");
      }

      // 이미지 업로드
      if (imageFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (const file of imageFiles) {
          try {
            const url = await uploadImage(file, savedReview.review_id);
            if (url) {
              uploadedUrls.push(url);
            }
          } catch (error) {
            console.error("이미지 업로드 오류:", error);
          }
        }

        // 이미지 URL DB 저장
        if (uploadedUrls.length > 0) {
          await saveReviewImages(savedReview.review_id, uploadedUrls);
        }
      }

      alert("리뷰가 성공적으로 작성되었습니다.");
      router.push(`/place/${placeId}`);
    } catch (error) {
      console.error("리뷰 제출 오류:", error);
      alert("리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{placeName} 여행지 리뷰 작성</h1>
          <p className="text-lg text-gray-600">"{placeName}" 리뷰를 작성해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={profile?.display_name || "사용자"}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* 여행지 정보 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">리뷰 작성 여행지</p>
            <p className="text-xl font-bold text-blue-900">{placeName}</p>
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

          {/* 별점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              별점 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {renderStars(rating)}
              {rating > 0 && (
                <span className="ml-4 text-2xl font-bold text-gray-800">
                  {rating}점
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

            {/* 이미지 미리보기 */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(index)}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 추가 버튼 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-gray-600 font-medium">
                    사진을 업로드하세요
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    현재: {imageFiles.length} / 5
                  </p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "리뷰 작성 중..." : "리뷰 작성하기"}
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
    </div>
  );
}
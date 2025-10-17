// component/review/ReviewForm.tsx
"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useProfile } from "@/hook/useProfile";
import ImageModal from "./ImageModal";

interface ReviewFormProps {
  reviewId?: string;
  placeId?: string;
}

interface Place {
  place_id: string;
  place_name: string;
  place_address: string;
  place_image: string | null;
}

export default function ReviewForm({ reviewId, placeId }: ReviewFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const editReviewId = searchParams.get('edit');
  const currentReviewId = editReviewId || reviewId;

  // 폼 상태
  const [userId, setUserId] = useState<string>("");
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // 이미지 관련 상태
  const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(0);

  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 프로필 훅 사용
  const { profile } = useProfile(userId);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
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

  // 지역 선택 시 해당 지역의 여행지 목록 가져오기 (수정 모드에서는 실행 안 함)
  useEffect(() => {
    if (currentReviewId) return; // 수정 모드에서는 여행지 목록을 가져오지 않음
    
    if (!selectedRegion) {
      setPlaces([]);
      setSelectedPlace(null);
      return;
    }

    const fetchPlacesByRegion = async () => {
      setIsLoadingPlaces(true);
      try {
        const { data, error } = await supabase
          .from("place")
          .select("place_id, place_name, place_address, place_image, region!inner(region_name)")
          .eq("region.region_name", selectedRegion)
          .order("place_name", { ascending: true });

        if (error) {
          console.error("여행지 목록 조회 실패:", error);
          setPlaces([]);
          return;
        }

        // 타입 안전하게 변환
        const placesData: Place[] = (data || []).map((item: any) => ({
          place_id: String(item.place_id),
          place_name: String(item.place_name),
          place_address: String(item.place_address || ""),
          place_image: item.place_image ? String(item.place_image) : null,
        }));

        setPlaces(placesData);
      } catch (error) {
        console.error("여행지 목록 조회 오류:", error);
        setPlaces([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchPlacesByRegion();
  }, [selectedRegion, currentReviewId]);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (currentReviewId) {
      const fetchReview = async () => {
        setIsLoading(true);
        const review = await getReviewById(currentReviewId);

        if (review) {
          setSelectedRegion(review.region);
          setTitle(review.review_title);
          setContent(review.review_content);
          setRating(Math.round(review.rating));

          const images = review.images.map((img) => ({
            id: img.review_image_id,
            url: img.review_image,
          }));
          setExistingImages(images);

          // ✅ 수정 모드: 리뷰에서 place_id를 가져와 여행지 정보 조회
          if (review.place_id) {
            try {
              const { data: placeData, error: placeError } = await supabase
                .from("place")
                .select("place_id, place_name, place_address, place_image")
                .eq("place_id", review.place_id)
                .single();

              if (!placeError && placeData) {
                const place: Place = {
                  place_id: String(placeData.place_id),
                  place_name: String(placeData.place_name),
                  place_address: String(placeData.place_address || ""),
                  place_image: placeData.place_image ? String(placeData.place_image) : null,
                };
                setSelectedPlace(place);
              }
            } catch (error) {
              console.error("여행지 정보 조회 오류:", error);
            }
          }
        }

        setIsLoading(false);
      };

      fetchReview();
    }
  }, [currentReviewId]);

  // 이미지 클릭 핸들러
  const handleImageClick = (images: string[], index: number): void => {
    setModalImages(images);
    setModalIndex(index);
    setModalOpen(true);
  };

  // 모달 네비게이션
  const handleModalNext = (): void => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = (): void => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  // 새 이미지 파일 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
  ): Promise<void> => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    const success = await deleteReviewImage(imageId, imageUrl);
    if (success) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  // 새 이미지 삭제
  const handleRemoveNewImage = (index: number): void => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 별 클릭
  const handleStarClick = (position: number): void => {
    setRating(position);
  };

  // 별 호버
  const handleStarHover = (position: number): void => {
    setHoveredRating(position);
  };

  // 별 렌더링
  const renderStar = (position: number, currentRating: number): JSX.Element => {
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // 유효성 검사
    if (!selectedRegion.trim()) {
      alert("지역을 선택해주세요.");
      return;
    }
    if (!selectedPlace) {
      alert("여행지를 선택해주세요.");
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
      if (currentReviewId) {
        // 수정 모드
        const updated = await updateReview(currentReviewId, {
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

        if (newImageFiles.length > 0) {
          const uploadedUrls: string[] = [];

          for (const file of newImageFiles) {
            const url = await uploadImage(file, currentReviewId);
            if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
            const success = await saveReviewImages(currentReviewId, uploadedUrls);
            if (!success) {
              console.error("이미지 DB 저장 실패");
            }
          }
        }

        alert("리뷰가 수정되었습니다.");
        router.push("/review");
      } else {
        // 작성 모드
        const savedReview = await saveReview({
          place_id: selectedPlace.place_id,
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
        {currentReviewId ? "리뷰 수정" : "리뷰 작성"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={profile?.display_name || "사용자"}
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
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedPlace(null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!currentReviewId}
          >
            <option value="">지역을 선택하세요</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ 수정 모드: 선택된 여행지 고정 표시 (변경 불가) */}
        {currentReviewId && selectedPlace ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              여행지 (변경 불가)
            </label>
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {selectedPlace.place_image && (
                  <img
                    src={selectedPlace.place_image}
                    alt={selectedPlace.place_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    리뷰 작성된 여행지
                  </p>
                  <p className="text-gray-900 font-bold text-lg">
                    📍 {selectedPlace.place_name}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    {selectedPlace.place_address}
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* 작성 모드: 여행지 선택 */
          selectedRegion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                여행지 <span className="text-red-500">*</span>
              </label>
              
              {isLoadingPlaces ? (
                <div className="text-center py-4 text-gray-500">
                  여행지 목록을 불러오는 중...
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  해당 지역에 등록된 여행지가 없습니다.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                  {places.map((place) => (
                    <div
                      key={place.place_id}
                      onClick={() => setSelectedPlace(place)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPlace?.place_id === place.place_id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'border-b border-gray-100'
                      }`}
                    >
                      {place.place_image && (
                        <img
                          src={place.place_image}
                          alt={place.place_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {place.place_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {place.place_address}
                        </div>
                      </div>
                      {selectedPlace?.place_id === place.place_id && (
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* ✅ 작성 모드: 선택된 여행지 고정 표시 */}
        {!currentReviewId && selectedPlace && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {selectedPlace.place_image && (
                <img
                  src={selectedPlace.place_image}
                  alt={selectedPlace.place_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium mb-1">
                  선택된 여행지
                </p>
                <p className="text-blue-900 font-bold text-lg">
                  📍 {selectedPlace.place_name}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  {selectedPlace.place_address}
                </p>
              </div>
              <svg
                className="w-8 h-8 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
           리뷰 제목 <span className="text-red-500">*</span>
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

          {/* 기존 이미지 */}
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
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "처리 중..." : currentReviewId ? "수정하기" : "작성하기"}
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
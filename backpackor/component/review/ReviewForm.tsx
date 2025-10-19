"use client";

import TravelListContainer from "@/component/place/TravelListContainer";
import { useProfile } from "@/hook/useProfile";
import {
  deleteReviewImage,
  getReviewById,
  saveReview,
  saveReviewImages,
  updateReview,
  uploadImage,
} from "@/lib/reviewStoreSupabase";
import { supabase } from "@/lib/supabaseClient";
import type { Place } from "@/type/place";
import { useRouter, useSearchParams } from "next/navigation";
import { JSX, useEffect, useMemo, useRef, useState } from "react";

export default function ReviewForm({
  reviewId,
  placeId,
}: {
  reviewId?: string;
  placeId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editReviewId = searchParams.get("edit");
  const currentReviewId = editReviewId || reviewId;

  const [userId, setUserId] = useState<string>("");
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string }>
  >([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { profile } = useProfile(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ 사용자 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUserInfo();
  }, []);

  // ✅ 전체 여행지 목록 가져오기
  useEffect(() => {
    if (currentReviewId) return;
    const fetchAllPlaces = async () => {
      setIsLoadingPlaces(true);
      try {
        const { data, error } = await supabase.from("place").select(`
          place_id,
          place_name,
          place_address,
          place_image,
          average_rating,
          favorite_count,
          region_id,
          place_category
        `);

        if (error) throw error;
        setAllPlaces(data || []);
      } catch (error) {
        console.error("전체 여행지 목록 조회 오류:", error);
        setAllPlaces([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };
    fetchAllPlaces();
  }, [currentReviewId]);

  // ✅ 수정 모드일 경우 기존 리뷰 불러오기
  useEffect(() => {
    if (!currentReviewId) return;
    const fetchReview = async () => {
      setIsLoading(true);
      try {
        const reviewData = await getReviewById(currentReviewId);
        if (reviewData) {
          setTitle(reviewData.review_title);
          setContent(reviewData.review_content);
          setRating(reviewData.rating);
          setExistingImages(
            reviewData.images.map((img) => ({
              id: img.review_image_id,
              url: img.review_image,
            }))
          );
        }
      } catch (error) {
        console.error("리뷰 데이터 불러오기 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReview();
  }, [currentReviewId]);

  // ✅ 여행지 선택 핸들러
  const handlePlaceSelectById = (placeId: string) => {
    const foundPlace = allPlaces.find((p) => p.place_id === placeId);
    if (foundPlace) setSelectedPlace(foundPlace);
  };

  // ✅ 이미지 업로드 관련 핸들러 (개수 제한 제거)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const previews = newFiles.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...newFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedFiles = [...newImageFiles];
    const updatedPreviews = [...newImagePreviews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedPreviews);
  };

  const handleRemoveExistingImage = async (
    imageId: number,
    imageUrl: string
  ) => {
    const confirmDelete = confirm("이미지를 삭제하시겠습니까?");
    if (!confirmDelete) return;
    const success = await deleteReviewImage(imageId, imageUrl);
    if (success) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  // ✅ 리뷰 저장 및 수정
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (!selectedPlace) {
      alert("리뷰를 작성할 여행지를 선택해주세요.");
      return;
    }
    if (!title.trim() || !content.trim() || rating === 0) {
      alert("제목, 내용, 별점을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      let review_id = currentReviewId;

      if (review_id) {
        await updateReview(review_id, {
          review_title: title,
          review_content: content,
          rating,
        });
      } else {
        const newReview = await saveReview({
          user_id: userId,
          place_id: selectedPlace.place_id, // 선택된 장소의 ID
          region: selectedPlace.region ?? '', // 선택된 장소의 지역 (Review 타입에 region 필드가 있음)
          review_title: title,
          review_content: content,
          rating,
        });
        review_id = newReview?.review_id;
      }

      // ✅ 이미지 업로드 및 DB 저장
      if (newImageFiles.length > 0 && review_id) {
        const imageUrls = await Promise.all(
          newImageFiles.map((file) => uploadImage(file, review_id!))
        );

        const validUrls = imageUrls.filter((url): url is string => !!url);
        if (validUrls.length > 0) {
          await saveReviewImages(review_id!, validUrls);
        }
      }

      alert(
        currentReviewId
          ? "리뷰가 수정되었습니다."
          : "리뷰가 성공적으로 등록되었습니다."
      );
      router.push(`/review`);
    } catch (error) {
      console.error("리뷰 저장/수정 오류:", error);
      alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 별점 표시
  const handleStarClick = (pos: number) => setRating(pos);
  const handleStarHover = (pos: number) => setHoveredRating(pos);
  const renderStar = (pos: number, current: number): JSX.Element => {
    const filled = pos <= current;
    return (
      <button
        key={pos}
        type="button"
        onClick={() => handleStarClick(pos)}
        onMouseEnter={() => handleStarHover(pos)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`text-5xl cursor-pointer focus:outline-none transition-all hover:scale-110 ${
          filled ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </button>
    );
  };

  const placesForList = useMemo(() => allPlaces || [], [allPlaces]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {currentReviewId ? "리뷰 수정" : "리뷰 작성"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* 왼쪽 폼 */}
        <div>
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
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* 여행지 */}
            {selectedPlace && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  여행지
                </label>
                <div className="border-2 rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    {selectedPlace.place_image && (
                      <img
                        src={selectedPlace.place_image}
                        alt={selectedPlace.place_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-bold text-lg text-blue-900">
                        {selectedPlace.place_name}
                      </p>
                      <p className="text-sm text-blue-700">
                        {selectedPlace.place_address}
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        ⭐ 평균 평점:{" "}
                        {selectedPlace.average_rating
                          ? selectedPlace.average_rating.toFixed(1)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리뷰 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* 별점 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                별점
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((pos) =>
                  renderStar(pos, hoveredRating || rating)
                )}
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
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="리뷰 내용을 입력하세요"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 업로드
              </label>
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
                      여러 이미지를 한 번에 업로드할 수 있습니다
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

              {/* 미리보기 */}
              <div className="flex flex-wrap gap-3">
                {[
                  ...existingImages,
                  ...newImagePreviews.map((src, i) => ({ url: src, id: i })),
                ].map((img, index) => (
                  <div
                    key={img.id}
                    className="relative group w-24 h-24 border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt="리뷰 이미지"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        existingImages.find((ex) => ex.id === img.id)
                          ? handleRemoveExistingImage(img.id, img.url)
                          : handleRemoveNewImage(index)
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-90 hover:opacity-100 transition"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting
                  ? "처리 중..."
                  : currentReviewId
                  ? "수정하기"
                  : "작성하기"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>

        {/* 오른쪽 여행지 목록 */}
        <div>
          {!currentReviewId &&
            (isLoadingPlaces ? (
              <div className="text-center py-10 text-gray-500">
                여행지 목록을 불러오는 중...
              </div>
            ) : (
              <TravelListContainer
                places={placesForList}
                onAddPlace={() => {}}
                onPlaceClick={handlePlaceSelectById}
                regionOptions={[]}
                initialRegion=""
              />
            ))}
        </div>
      </div>
    </div>
  );
}

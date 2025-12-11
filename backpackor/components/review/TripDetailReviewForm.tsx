// component/review/TripDetailReviewForm.tsx
"use client";

import ImageModal from "@/components/review/ImageModal";
import { useProfile } from "@/hooks/auth/useProfile";
import {
  saveReview,
  saveReviewImages,
  uploadImage,
} from "@/apis/reviewApi";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface TripDetailReviewFormProps {
  editId?: string | null;
}

export default function TripDetailReviewForm({
  editId,
}: TripDetailReviewFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 오는 placeId/placeName (편집 모드인 경우 review에서 덮어쓰기 가능)
  const initialPlaceId = searchParams.get("placeId");
  const initialPlaceName = searchParams.get("placeName");
  const [placeId, setPlaceId] = useState<string | null>(initialPlaceId);
  const [placeName, setPlaceName] = useState<string | null>(initialPlaceName);

  const [userId, setUserId] = useState<string>("");
  const [placeInfo, setPlaceInfo] = useState<{
    place_name: string;
    place_address: string | null;
    place_image: string | null;
    region_name: string | null;
    region_id: number | null;
  } | null>(null);

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 초기화 - 사용자 정보, 여행지 정보, (편집 모드라면) 기존 리뷰 로드
  useEffect(() => {
    const initializeData = async () => {
      // 사용자 정보
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (err) {
        console.error("getUser error", err);
      }

      // 편집 모드: 기존 리뷰 불러오기
      if (editId) {
        try {
          const { data: reviewData, error: reviewError } = await supabase
            .from("review")
            .select("*")
            .eq("review_id", editId)
            .single();

          if (reviewError) {
            // Review load error
          } else if (reviewData) {
            setTitle(reviewData.review_title || "");
            setContent(reviewData.review_content || "");
            setRating(reviewData.rating ?? 0);

            // 편집되는 리뷰의 placeId가 있으면 사용
            if (reviewData.place_id) {
              setPlaceId(reviewData.place_id);
            }

            // 기존에 저장된 이미지 URL 불러오기
            try {
              const { data: imagesData, error: imagesError} = await supabase
                .from("review_image")
                .select("review_image_id, review_image, image_order")
                .eq("review_id", editId)
                .order("image_order", { ascending: true });

              if (!imagesError && imagesData) {
                const urls = (imagesData as Array<{ review_image_id: number; review_image: string; image_order: number }>)
                  .map((r) => r.review_image)
                  .filter(Boolean);
                setImagePreviews(urls);
                // 이미지 파일(File) 객체는 클라이언트에서 복원할 수 없으므로 imageFiles는 비워둡니다.
              }
            } catch (imgErr) {
              console.error("review images load error", imgErr);
            }
          }
        } catch (err) {
          console.error("load review failed", err);
        }
      }

      // place 정보 불러오기 (placeId가 결정된 이후에 실행)
      const effectivePlaceId = placeId;
      if (!effectivePlaceId) {
        // 편집모드가 아니고 URL에 placeId가 없으면 잘못된 접근
        if (!editId) {
          alert("잘못된 접근입니다.");
          router.push("/review");
          return;
        }
        // 편집모드인데도 placeId가 없다면 이미 위에서 시도했거나 review에서 가져오지 못한 경우
      }

      if (effectivePlaceId) {
        try {
          const { data: placeData, error: placeError } = await supabase
            .from("place")
            .select(
              `
              place_name,
              place_address,
              place_image,
              region!inner(region_name)
            `
            )
            .eq("place_id", effectivePlaceId)
            .single();

          if (!placeError && placeData) {
            const placeWithRegion = placeData as typeof placeData & { region?: { region_name: string; region_id: number } };
            setPlaceInfo({
              place_name: placeData.place_name,
              place_address: placeData.place_address,
              place_image: placeData.place_image,
              region_name: placeWithRegion.region?.region_name || null,
              region_id: placeWithRegion.region?.region_id || null,
            });
            // placeName이 비어있으면 placeData로 채움
            if (!placeName) {
              setPlaceName(placeData.place_name);
            }
          } else {
            // Place load warning
          }
        } catch (err) {
          // Place load failed
        }
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, placeId]); // placeId가 설정되면 장소 정보를 다시 불러옵니다.

  // 별점 클릭 핸들러
  const handleStarClick = (rating: number) => {
    setRating(rating);
  };

  // 별점 렌더링
  const renderStars = (currentRating: number) => {
    return [1, 2, 3, 4, 5].map((position) => (
      <button
        key={position}
        type="button"
        onClick={() => handleStarClick(position)}
        onMouseEnter={() => setHoveredRating(position)}
        onMouseLeave={() => setHoveredRating(0)}
        className={`text-5xl cursor-pointer focus:outline-none transition-all hover:scale-110 ${
          position <= (hoveredRating || currentRating)
            ? "text-yellow-400"
            : "text-gray-300"
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

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 이미지 클릭 핸들러 (모달)
  const handleImageClick = (index: number) => {
    setModalImages(imagePreviews);
    setModalIndex(index);
    setModalOpen(true);
  };

  const handleModalNext = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = () => {
    setModalIndex(
      (prev) => (prev - 1 + modalImages.length) % modalImages.length
    );
  };

  // 폼 제출 (새로 작성 / 편집 모두 처리)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (!placeInfo?.region_name) {
      alert("여행지 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
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
      let savedReview: { review_id: string } | null = null;

      if (editId) {
        // 편집 모드: 기존 리뷰 업데이트
        const { data: updated, error: updateError } = await supabase
          .from("review")
          .update({
            review_title: title,
            review_content: content,
            rating,
          })
          .eq("review_id", editId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        savedReview = updated;
      } else {
        // 새 리뷰 저장 (saveReview helper 사용)
        const result = await saveReview({
          place_id: placeId!,
          user_id: userId,
          region_id: placeInfo.region_id,
          review_title: title,
          review_content: content,
          rating: rating,
        });
        if (!result) throw new Error("리뷰 저장에 실패했습니다.");
        savedReview = result;
      }

      const reviewId = editId ?? savedReview?.review_id ?? "";

      // 이미지 업로드 (새로 선택한 파일들만 업로드)
      if (imageFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (const file of imageFiles) {
          try {
            const url = await uploadImage(file, reviewId);
            if (url) {
              uploadedUrls.push(url);
            }
          } catch (error) {
            console.error("이미지 업로드 오류:", error);
          }
        }

        // 이미지 URL DB 저장 (편집/생성 모두 동일 처리)
        if (uploadedUrls.length > 0) {
          await saveReviewImages(reviewId, uploadedUrls);
        }
      }

      alert(
        editId
          ? "리뷰가 성공적으로 수정되었습니다."
          : "리뷰가 성공적으로 작성되었습니다."
      );

      // 리뷰 수정 시: 리뷰 상세 페이지로 이동
      // 새로 작성 시: 장소 페이지로 이동
      if (editId) {
        router.push(`/review/detail/${reviewId}`);
      } else {
        const targetPlaceId = placeId ?? "";
        if (targetPlaceId) {
          router.push(`/place/${targetPlaceId}`);
        } else {
          router.push("/review");
        }
      }
    } catch (error) {
      console.error("리뷰 제출 오류:", error);
      alert("리뷰 작성/수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {editId ? "여행지 리뷰 수정" : "여행지 리뷰 작성"}
          </h1>
          <p className="text-lg text-gray-600">
            "{placeInfo?.place_name || placeName}" 리뷰를{" "}
            {editId ? "수정" : "작성"}해주세요
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
        >
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
          {placeInfo && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-3">
                리뷰 작성 여행지
              </p>
              <div className="flex items-center gap-4">
                {placeInfo.place_image && (
                    <Image
                        src={placeInfo.place_image}
                        alt={placeInfo.place_name}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg shadow-sm"
                    />
                )}
                <div className="flex-1">
                  <p className="text-xl font-bold text-blue-900 mb-1">
                    {placeInfo.place_name}
                  </p>
                  {placeInfo.place_address && (
                    <p className="text-sm text-blue-700">
                      {placeInfo.place_address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                      <Image
                          src={preview}
                          alt={`미리보기 ${index + 1}`}
                          width={400}
                          height={96}
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
              {isSubmitting
                ? editId
                  ? "리뷰 수정 중..."
                  : "리뷰 작성 중..."
                : editId
                ? "리뷰 수정하기"
                : "리뷰 작성하기"}
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

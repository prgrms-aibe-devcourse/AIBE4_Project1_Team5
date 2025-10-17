"use client";

import {
  ReviewActionButtons,
  WriteButton,
} from "@/component/review/ReviewButton";
import Sort from "@/component/review/ReviewSort";
import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import {
  getRegions,
  getReviews,
  getReviewsByRegion,
  type ReviewWithImages,
} from "@/lib/reviewStoreSupabase";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ============================
// 개별 리뷰 카드
// ============================

function ReviewCard({
  review,
  user,
  onEdit,
  onDelete,
}: {
  review: ReviewWithImages;
  user: any;
  onEdit: (reviewId: string, e: React.MouseEvent) => void;
  onDelete: (reviewId: string) => void;
}) {
  const router = useRouter();
  const { profile, profileUrl, isLoading } = useProfile(review.user_id);
  const [placeName, setPlaceName] = useState<string>("");
  const [placeAddress, setPlaceAddress] = useState<string>("");

  // 여행지 정보 가져오기
  useEffect(() => {
    const fetchPlaceInfo = async () => {
      if (review.place_id) {
        const { data, error } = await supabase
          .from("place")
          .select("place_name, place_address")
          .eq("place_id", review.place_id)
          .single();

        if (!error && data) {
          setPlaceName(data.place_name);
          setPlaceAddress(data.place_address || "");
        }
      }
    };
    fetchPlaceInfo();
  }, [review.place_id]);

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${
            i <= roundedRating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => router.push(`/review/detail/${review.review_id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* 썸네일 */}
      {review.images.length > 0 ? (
        <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
          <img
            src={
              review.images.sort((a, b) => a.image_order - b.image_order)[0]
                .review_image
            }
            alt={review.review_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.error(
                "이미지 로드 실패:",
                review.images.sort((a, b) => a.image_order - b.image_order)[0]
                  .review_image
              );
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML =
                  '<div class="flex items-center justify-center h-full"><span class="text-gray-400 text-sm font-medium">이미지 로드 실패</span></div>';
              }
            }}
          />

          {/* 이미지 개수 */}
          {review.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{review.images.length}</span>
            </div>
          )}

          {/* 별점 배지 */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-bold text-gray-900">
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300"
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
        </div>
      )}

      {/* 내용 */}
      <div className="p-5">
        {/* 여행지 정보 */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-gray-900 truncate mb-1">
                {placeName || "여행지 정보 없음"}
              </h4>
              {placeAddress && (
                <p className="text-xs text-gray-500 truncate">{placeAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* 리뷰 제목 */}
        <h3 className="text-base font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
          {review.review_title}
        </h3>

        {/* 별점 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">{renderStars(review.rating)}</div>
        </div>

        {/* 내용 미리보기 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {review.review_content}
        </p>

        {/* 작성자/날짜 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <img
                src={
                  profileUrl && profileUrl.trim() !== ""
                    ? profileUrl
                    : "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png"
                }
                alt={profile?.display_name || "프로필"}
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
                onError={(e) => {
                  console.error("프로필 이미지 로드 실패:", profileUrl);
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";
                }}
              />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {profile?.display_name || "익명"}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(review.created_at)}
          </span>
        </div>

        {/* 본인 리뷰인 경우 수정/삭제 */}
        {user && user.id === review.user_id && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <ReviewActionButtons
              reviewId={review.review_id}
              onEdit={(e) => onEdit(review.review_id, e)}
              onDelete={() => onDelete(review.review_id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================
// 리뷰 목록 페이지
// ============================

export default function ReviewListPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewWithImages[]>([]);
  const [sortedReviews, setSortedReviews] = useState<ReviewWithImages[]>([]);
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [currentSort, setCurrentSort] = useState("popularity_desc");
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 지역 목록 불러오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(["전체", ...regionList]);
    };
    fetchRegions();
  }, []);

  // ✅ 리뷰 목록 불러오기
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      const data =
        selectedRegion === "전체"
          ? await getReviews()
          : await getReviewsByRegion(selectedRegion);
      setReviews(data);
      setIsLoading(false);
    };
    fetchReviews();
  }, [selectedRegion]);

  // ✅ 정렬
  useEffect(() => {
    const sorted = [...reviews];
    switch (currentSort) {
      case "popularity_desc":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "name_asc":
        sorted.sort((a, b) => b.images.length - a.images.length);
        break;
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    setSortedReviews(sorted);
  }, [reviews, currentSort]);

  // ✅ 리뷰 삭제 콜백
  const handleDeleteCallback = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
  };

  // ✅ 리뷰 수정
  const handleEdit = (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/review/write?edit=${reviewId}`);
  };

  // ✅ 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ✅ 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              여행지 리뷰
            </h1>
            <p className="text-gray-600 text-base">
              실제 여행자들의 생생한 여행지 평가를 확인해보세요
            </p>
          </div>
          {user && <WriteButton />}
        </div>

        {/* 필터 & 정렬 */}
        <div className="flex justify-between items-center mb-8 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-3 items-center">
            {/* 지역별 필터 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById("region-dropdown");
                  if (dropdown) dropdown.classList.toggle("hidden");
                }}
                className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8.75Z" />
                </svg>
                {selectedRegion === "전체" ? "지역별 필터" : selectedRegion}
              </button>
              <ul
                id="region-dropdown"
                className="hidden absolute z-10 mt-1 w-48 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto"
              >
                {regions.map((region) => (
                  <li
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      const dropdown =
                        document.getElementById("region-dropdown");
                      if (dropdown) dropdown.classList.add("hidden");
                    }}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
                  >
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Sort currentSort={currentSort} onSortChange={setCurrentSort} />
        </div>

        {/* 리뷰 목록 */}
        {sortedReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2 font-semibold">
              {selectedRegion === "전체"
                ? "아직 작성된 리뷰가 없습니다"
                : `${selectedRegion} 지역에 작성된 리뷰가 없습니다`}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              첫 리뷰의 주인공이 되어보세요!
            </p>
            {user && <WriteButton />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReviews.map((review) => (
              <ReviewCard
                key={review.review_id}
                review={review}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDeleteCallback}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

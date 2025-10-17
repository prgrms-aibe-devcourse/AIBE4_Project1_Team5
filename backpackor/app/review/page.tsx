// app/review/page.tsx
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 개별 리뷰 카드 컴포넌트
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

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-lg ${
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
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => router.push(`/review/detail/${review.review_id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* 썸네일 이미지 */}
      {review.images.length > 0 ? (
        <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
          <img
            src={review.images[0].review_image}
            alt={review.review_title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              console.error("이미지 로드 실패:", review.images[0].review_image);
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML =
                  '<div class="flex items-center justify-center h-full"><span class="text-gray-400 text-sm font-medium">이미지 로드 실패</span></div>';
              }
            }}
          />
          {/* 이미지 개수 표시 */}
          {review.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-md flex items-center gap-1.5">
              <span className="text-base">📷</span>
              <span>{review.images.length}</span>
            </div>
          )}
          {/* 지역 뱃지 */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white bg-opacity-95 text-blue-600 text-sm font-bold rounded-full shadow-lg backdrop-blur-md">
              <span className="text-base">📍</span>
              {review.region}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-400 font-medium">이미지 없음</span>
        </div>
      )}

      {/* 내용 */}
      <div className="p-6">
        {/* 제목 */}
        <h3 className="text-xl font-bold mb-3 line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
          {review.review_title}
        </h3>

        {/* 별점 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">{renderStars(review.rating)}</div>
          <span className="text-base font-bold text-gray-800">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* 내용 미리보기 */}
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {review.review_content}
        </p>

        {/* 작성자 & 날짜 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            {/* 프로필 이미지 */}
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <img
                src={
                  profileUrl && profileUrl.trim() !== ""
                    ? profileUrl
                    : "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png"
                }
                alt={profile?.display_name || "프로필"}
                className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
                onError={(e) => {
                  console.error("프로필 이미지 로드 실패:", profileUrl);
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";
                }}
              />
            )}
            <span className="text-sm font-semibold text-gray-700">
              {profile?.display_name || "익명 사용자"}
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {formatDate(review.created_at)}
          </span>
        </div>

        {/* 본인 리뷰인 경우 수정/삭제 버튼 */}
        {user && user.id === review.user_id && (
          <div className="mt-4 pt-4 border-t border-gray-100">
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

export default function ReviewListPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewWithImages[]>([]);
  const [sortedReviews, setSortedReviews] = useState<ReviewWithImages[]>([]);
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [currentSort, setCurrentSort] = useState("popularity_desc");
  const [isLoading, setIsLoading] = useState(true);

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(["전체", ...regionList]);
    };

    fetchRegions();
  }, []);

  // 리뷰 목록 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);

      let data: ReviewWithImages[];
      if (selectedRegion === "전체") {
        data = await getReviews();
      } else {
        data = await getReviewsByRegion(selectedRegion);
      }

      setReviews(data);
      setIsLoading(false);
    };

    fetchReviews();
  }, [selectedRegion]);

  // 정렬 적용
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

  // 리뷰 삭제
  const handleDeleteCallback = (reviewId: string) => {
    setReviews(reviews.filter((review) => review.review_id !== reviewId));
  };

  // 리뷰 수정
  const handleEdit = (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/review/write?edit=${reviewId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:px-8 lg:py-12">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              여행 리뷰
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              다양한 여행지의 생생한 후기를 확인해보세요
            </p>
          </div>
          {user && <WriteButton />}
        </div>

        {/* 필터 & 정렬 */}
        <div className="flex justify-between items-center my-6">
          <div className="flex gap-4 items-center">
            {/* 지역별 필터 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById("region-dropdown");
                  if (dropdown) {
                    dropdown.classList.toggle("hidden");
                  }
                }}
                className="px-4 py-2 text-sm font-semibold border rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
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
                className="hidden absolute z-10 mt-1 w-48 bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto"
              >
                {regions.map((region) => (
                  <li
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      const dropdown =
                        document.getElementById("region-dropdown");
                      if (dropdown) {
                        dropdown.classList.add("hidden");
                      }
                    }}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
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
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-gray-200 shadow-md">
            <p className="text-gray-600 text-xl mb-3 font-bold">
              {selectedRegion === "전체"
                ? "아직 작성된 리뷰가 없습니다."
                : `${selectedRegion} 지역에 작성된 리뷰가 없습니다.`}
            </p>
            <p className="text-gray-500 text-base mb-8 font-medium">
              첫 리뷰의 주인공이 되어보세요!
            </p>
            {user && <WriteButton />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

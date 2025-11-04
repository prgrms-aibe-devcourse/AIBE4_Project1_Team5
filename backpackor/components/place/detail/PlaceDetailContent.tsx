// 여행지 상세 내용 컴포넌트
"use client";

import FavoriteButton from "@/components/place/FavoriteButton";
import RelatedPlacesSection from "@/components/place/detail/RelatedPlacesSection";
import TravelReviewSection from "@/components/review/TravelReviewSection";
import type { PlaceDetail } from "@/types/place";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface PlaceDetailContentProps {
  place: PlaceDetail;
  regionName: string;
  initialIsFavorite: boolean;
  reviewCount: number;
  averageRating: number;
  showReviewButton?: boolean;
}

export default function PlaceDetailContent({
  place,
  regionName,
  initialIsFavorite,
  reviewCount,
  averageRating,
  showReviewButton = false,
}: PlaceDetailContentProps) {
  const router = useRouter();

  const handleClose = () => {
    // 세션 스토리지에 저장된 페이지, 검색어, 정렬 옵션, 지역 필터 복원
    const savedPage = sessionStorage.getItem("place_list_page");
    const savedSearch = sessionStorage.getItem("place_filter_search_keyword");
    const savedSort = sessionStorage.getItem("place_filter_sort");
    const savedRegion = sessionStorage.getItem("place_filter_region_id");

    const params = new URLSearchParams();
    params.set("page", savedPage || "1");
    if (savedSearch) {
      params.set("search", savedSearch);
    }
    if (savedSort && savedSort !== "popularity") {
      params.set("sort", savedSort);
    }
    if (savedRegion) {
      params.set("region", savedRegion);
    }

    router.push(`/place?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white min-h-screen">
      {/* 커버 이미지 섹션 */}
      <div
        className="relative h-[400px] bg-cover bg-center mb-0 flex items-center justify-center md:h-[350px] sm:h-[300px]"
        style={{ backgroundImage: `url(${place.place_image})` }}
      >
        {/* 닫기 버튼 - 우측 상단 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg backdrop-blur-md hover:bg-white transition-all duration-200 hover:shadow-xl flex items-center justify-center group"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
        </button>

        {/* 밝은 그라데이션 오버레이 */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-white/40 to-white/60" />

        {/* 오버레이 정보 - 중앙 배치 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] text-center flex flex-col items-center gap-3 px-5 z-[5]">
          {/* 좋아요 버튼 - 카테고리 위에 위치 */}
          <div className="w-12 h-12 bg-white/90 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-xl mb-2">
            <FavoriteButton
              initialIsFavorite={initialIsFavorite}
              initialFavoriteCount={place.favorite_count}
              placeId={place.place_id}
            />
          </div>

          <h2 className="text-[25px] font-bold m-0 tracking-tight leading-tight text-gray-900">
            [ {place.place_category} ]
          </h2>
          <h1 className="text-[40px] font-bold m-0 tracking-tight text-black leading-tight md:text-[32px] sm:text-[28px]">
            {place.place_name}
          </h1>
        </div>
      </div>

      {/* 상세 내용 레이아웃 - 전체 너비 */}
      <div className="max-w-[1200px] mx-auto py-10 px-6 lg:px-5 sm:py-8 sm:px-4">
        {/* 주소 섹션 */}
        <div className="mb-10 pb-6 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">위치</h3>
              <p className="text-lg text-gray-900">{place.place_address}</p>
            </div>
          </div>
        </div>

        {/* 여행지 소개 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            여행지 소개
          </h2>
          <p className="text-base leading-relaxed text-gray-700">
            {place.place_description}
          </p>
        </div>

        {/* 여행 리뷰 섹션 */}
        <TravelReviewSection
          placeId={place.place_id}
          averageRating={averageRating}
          reviewCount={reviewCount}
          showReviewButton={showReviewButton}
          placeName={place.place_name}
        />

        {/* 같이 가보면 좋을 장소 섹션 */}
        <RelatedPlacesSection
          regionId={place.region_id}
          currentPlaceId={place.place_id}
        />
      </div>
    </div>
  );
}

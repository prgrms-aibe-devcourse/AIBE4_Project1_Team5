// 여행지 상세 내용 컴포넌트
"use client";

import FavoriteButton from "@/components/place/FavoriteButton";
import RelatedPlacesSection from "@/components/place/detail/RelatedPlacesSection";
import TravelInfoSection from "@/components/place/detail/TravelInfoSection";
import TravelReviewSection from "@/components/review/TravelReviewSection";
import type { PlaceDetail } from "@/types/place";

interface PlaceDetailContentProps {
  place: PlaceDetail;
  initialIsFavorite: boolean;
  reviewCount: number;
  averageRating: number;
  showReviewButton?: boolean;
}

export default function PlaceDetailContent({
  place,
  initialIsFavorite,
  reviewCount,
  averageRating,
  showReviewButton = false,
}: PlaceDetailContentProps) {
  return (
    <div className="w-full bg-white min-h-screen">
      {/* 커버 이미지 섹션 */}
      <div
        className="relative h-[400px] bg-cover bg-center mb-0 flex items-center justify-center md:h-[350px] sm:h-[300px]"
        style={{ backgroundImage: `url(${place.place_detail_image})` }}
      >
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

      {/* 상세 내용 레이아웃 */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 py-8 px-6 mb-0 items-start lg:px-5 sm:py-6 sm:px-4">
        {/* 왼쪽 섹션 */}
        <div className="col-span-1">
          {/* 여행 소개 */}
          <div className="mb-12">
            <h2 className="text-xl font-bold m-0 mb-4 text-[#1a1a1a]">
              여행지 소개
            </h2>
            <p className="text-[15px] leading-relaxed text-[#4a4a4a] m-0">
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

        {/* 오른쪽 섹션 */}
        <div className="col-span-1 flex flex-col gap-4 xl:sticky xl:top-5 xl:self-start xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto scrollbar-none">
          <TravelInfoSection
            placeAddress={place.place_address}
            travelPeriod="2박 3일 ~ 3박 4일"
            flightInfo="인천/김포 공항"
          />
        </div>
      </div>
    </div>
  );
}

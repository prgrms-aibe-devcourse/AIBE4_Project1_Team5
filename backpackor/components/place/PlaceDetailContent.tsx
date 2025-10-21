// @/component/place/PlaceDetailContent.tsx
"use client";

import FavoriteButton from "@/components/place/FavoriteButton";
import RelatedPlacesSection from "@/components/place/RelatedPlacesSection";
import TravelInfoSection from "@/components/place/TravelInfoSection";
import TravelReviewSection from "@/components/review/TravelReviewSection";
import { TravelDetail } from "@/types/travel";
import styles from "./PlaceDetailContent.module.css";

interface PlaceDetailContentProps {
  place: TravelDetail;
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
    <div className={styles.travelAppContainer}>
      {/* 1. 커버 이미지 섹션 */}
      <div
        className={styles.coverSection}
        style={{ backgroundImage: `url(${place.place_detail_image})` }}
      >
        <FavoriteButton
          initialIsFavorite={initialIsFavorite}
          initialFavoriteCount={place.favorite_count}
          placeId={place.place_id}
        />
        <div className={styles.overlayInfo}>
          <h2>[ {place.place_category} ]</h2>
          <h1>{place.place_name}</h1>
        </div>
      </div>

      {/* 2. 상세 내용 레이아웃 */}
      <div className={styles.detailContentLayout}>
        {/* 2-A: 왼쪽 섹션 */}
        <div className={styles.detailLeftSection}>
          {/* 여행 소개 텍스트 */}
          <div className={styles.travelIntro}>
            <h2>여행 소개</h2>
            <p>{place.place_description}</p>
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

        {/* 2-B: 오른쪽 섹션 */}
        <div className={styles.detailRightSection}>
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

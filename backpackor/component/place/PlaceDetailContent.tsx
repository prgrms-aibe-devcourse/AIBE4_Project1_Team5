"use client";

import FavoriteButton from "@/component/place/FavoriteButton";
import RelatedPlacesSection from "@/component/place/RelatedPlacesSection";
import TravelReviewSection from "@/component/review/TravelReviewSection";
import TravelInfoSection from "@/component/place/TravelInfoSection";
import styles from "./PlaceDetailContent.module.css";
import { TravelDetail } from "@/type/travel";

interface Props {
  place: TravelDetail;
  initialIsFavorite: boolean;
  showReviewButton?: boolean;
}

export default function PlaceDetailContent({
  place,
  initialIsFavorite,
  showReviewButton = false,
}: Props) {
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
          <div className={styles.subtitleRatingLine}>
            <span className={styles.rating}>
              ⭐ {place.average_rating.toFixed(1)}
            </span>
          </div>
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

          {/* 여행 리뷰 섹션 - showReviewButton prop 전달 */}
          <TravelReviewSection
            placeId={place.place_id}
            averageRating={place.average_rating}
            reviewCount={place.favorite_count}
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
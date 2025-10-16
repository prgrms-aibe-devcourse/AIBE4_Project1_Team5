"use client";

// 찜하기 버튼, 관련 장소, 리뷰, 여행 정보 섹션 등 상세 UI 컴포넌트들을 import
import FavoriteButton from "@/component/place/FavoriteButton";
import RelatedPlacesSection from "@/component/place/RelatedPlacesSection";
import TravelReviewSection from "@/component/review/TravelReviewSection";
import TravelInfoSection from "@/component/place/TravelInfoSection";
import styles from "./PlaceDetailContent.module.css"; // CSS 모듈 import
import { TravelDetail } from "@/type/travel"; // 타입 import

// Props 타입 정의: place 데이터와 초기 찜 상태를 받음
interface Props {
  place: TravelDetail;
  initialIsFavorite: boolean;
}

// PlaceDetailContent 컴포넌트: 여행지 상세 UI를 렌더링
export default function PlaceDetailContent({
  place,
  initialIsFavorite,
}: Props) {
  return (
    <div className={styles.travelAppContainer}>
      {/* 1. 커버 이미지 섹션: 배경 이미지와 찜 버튼, 제목, 평점 표시 */}
      <div
        className={styles.coverSection}
        style={{ backgroundImage: `url(${place.place_detail_image})` }}
      >
        {/* 찜 버튼: 초기 찜 상태와 찜 개수, placeId 전달 */}
        <FavoriteButton
          initialIsFavorite={initialIsFavorite}
          initialFavoriteCount={place.favorite_count}
          placeId={place.place_id}
        />
        {/* 제목, 카테고리, 평점 정보 오버레이 */}
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

      {/* 2. 상세 내용 레이아웃: 왼쪽(소개, 리뷰, 추천), 오른쪽(여행 정보) */}
      <div className={styles.detailContentLayout}>
        {/* 2-A: 왼쪽 섹션 */}
        <div className={styles.detailLeftSection}>
          {/* 여행 소개 텍스트 */}
          <div className={styles.travelIntro}>
            <h2>여행 소개</h2>
            <p>{place.place_description}</p>
          </div>

          {/* 여행 리뷰 섹션: placeId, 평점, 리뷰 개수 전달 */}
          <TravelReviewSection
            placeId={place.place_id}
            averageRating={place.average_rating}
            reviewCount={place.favorite_count}
          />

          {/* 같이 가보면 좋을 장소 섹션: 지역 ID와 현재 장소 ID 전달 */}
          <RelatedPlacesSection
            regionId={place.region_id}
            currentPlaceId={place.place_id}
          />
        </div>

        {/* 2-B: 오른쪽 섹션 */}
        <div className={styles.detailRightSection}>
          {/* 여행 정보 섹션: 주소, 여행 기간, 비행 정보 등 */}
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

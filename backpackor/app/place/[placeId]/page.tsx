// app/place/[placeId]/page.tsx
import RelatedPlacesSection from "@/component/place/RelatedPlacesSection";
import TravelReviewSection from "@/component/review/TravelReviewSection";
import FavoriteButton from "@/component/place/FavoriteButton";
import TravelInfoSection from "@/component/place/TravelInfoSection";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabaseClient";
import { TravelDetail } from "@/type/travel";
import styles from "./page.module.css"; // ⭐ 이 줄 추가!

interface TravelDetailPageProps {
  params: {
    placeId: string;
  };
}

const TravelDetailPage = async ({
  params,
}: {
  params: { placeId: string } | Promise<{ placeId: string }>;
}) => {
  const { placeId } = await params;
  const supabase = createServerClient();

  const fetchDetail = async (id: string): Promise<TravelDetail> => {
    const { data: dbData, error: dbError } = await supabase
      .from("place")
      .select("*")
      .eq("place_id", id)
      .single();

    if (dbError || !dbData) {
      notFound();
    }

    return dbData as TravelDetail;
  };

  // 사용자의 찜 상태 확인
  const checkUserFavorite = async (id: string): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("user_favorite_place")
      .select("place_id")
      .eq("user_id", user.id)
      .eq("place_id", id)
      .single();

    return !!data;
  };

  const data = await fetchDetail(placeId);
  const initialIsFavorite = await checkUserFavorite(placeId);

  return (
    <div className={styles.travelAppContainer}>
      {/* 1. 커버 이미지 섹션 및 오버레이 정보 */}
      <div
        className={styles.coverSection}
        style={{
          backgroundImage: `url(${data.place_detail_image})`,
        }}
      >
        {/* 찜 버튼 */}
        <FavoriteButton
          initialIsFavorite={initialIsFavorite}
          initialFavoriteCount={data.favorite_count}
          placeId={data.place_id}
        />

        {/* 제목, 주소, 평점 정보 */}
        <div className={styles.overlayInfo}>
          <h2>[ {data.place_category} ]</h2>
          <h1>{data.place_name}</h1>
          <div className={styles.subtitleRatingLine}>
            <span className={styles.rating}>
              ⭐ {data.average_rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 상세 소개, 리뷰, 추천 장소 / 여행 정보 (2단 Grid 레이아웃) */}
      <div className={styles.detailContentLayout}>
        {/* 2-A: 왼쪽 섹션 (소개, 리뷰, 추천) */}
        <div className={styles.detailLeftSection}>
          {/* 여행 소개 섹션 */}
          <div className={styles.travelIntro}>
            <h2>여행 소개</h2>
            <p>{data.place_description}</p>
          </div>

          {/* 여행 리뷰 섹션 */}
          <TravelReviewSection
            placeId={data.place_id}
            averageRating={data.average_rating}
            reviewCount={data.favorite_count}
          />

          {/* 같이 가보면 좋을 장소 섹션 */}
          <RelatedPlacesSection
            regionId={data.region_id}
            currentPlaceId={data.place_id}
          />
        </div>

        {/* 2-B: 오른쪽 섹션 (여행 정보) */}
        <div className={styles.detailRightSection}>
          <TravelInfoSection
            placeAddress={data.place_address}
            travelPeriod="2박 3일 ~ 3박 4일"
            flightInfo="인천/김포 공항"
          />
        </div>
      </div>
    </div>
  );
};

export default TravelDetailPage;

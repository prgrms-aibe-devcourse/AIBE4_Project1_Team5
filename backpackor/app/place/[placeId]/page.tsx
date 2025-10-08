import TravelReviewSection from "@/components/place/reviews/TravelReviewSection";
import RelatedPlacesSection from "@/components/place/RelatedPlacesSection";
import { notFound } from "next/navigation";

import { TravelDetail } from "@/lib/type/travel";
import { createServerClient } from "@/lib/supabase/server";

const MOCK_DETAIL_DATA: TravelDetail = {
  place_id: "jeju-mock-id",
  place_name: "제주도",
  place_address: "제주특별자치도",
  place_description:
    "제주도는 대한민국 남서쪽에 위치한 화산섬으로, 독특한 지형과 아름다운 자연경관으로 유명합니다. 유네스코 세계자연유산으로 지정된 한국의 국립공원과 성산일출봉은 제주도의 특별한 지질학적 가치를 보여줍니다.",
  latitude: 33.4893,
  longitude: 126.498,
  place_image: "https://picsum.photos/1000/300?random=1",
  place_detail_image: "https://picsum.photos/1200/400?random=2",
  average_rating: 4.5,
  favorite_count: 243,
  region_id: 1,
  place_type: "자연관광",
};

interface TravelDetailPageProps {
  params: {
    placeId: string;
  };
}

const TravelDetailPage = async ({ params }: TravelDetailPageProps) => {
  const { placeId } = params;
  const supabase = await createServerClient();

  const fetchDetail = async (id: string): Promise<TravelDetail> => {
    const { data: dbData, error: dbError } = await supabase
      .from("place")
      .select("*")
      .eq("place_id", id)
      .single();

    if (dbError) {
      console.error("DB 오류 또는 데이터 없음. 목업 사용:", dbError);
      if (id === MOCK_DETAIL_DATA.place_id) {
        return MOCK_DETAIL_DATA;
      }
      notFound();
    }

    if (!dbData) {
      if (id === MOCK_DETAIL_DATA.place_id) {
        return MOCK_DETAIL_DATA;
      }
      notFound();
    }

    return dbData as TravelDetail;
  };

  const data = await fetchDetail(placeId);

  return (
    <div className="travel-app-container">
      {/* 1. 커버 이미지 섹션 및 오버레이 정보 */}
      <div
        className="cover-section"
        style={{
          backgroundImage: `url(${data.place_detail_image})`,
        }}
      >
        {/* 찜 버튼 */}
        <div className="favorite-button">❤️</div>

        {/* 제목, 주소, 평점 정보 */}
        <div className="overlay-info">
          <h1>{data.place_name}</h1>
          <div className="subtitle-rating-line">
            <span className="subtitle">{data.place_address}</span>
            <span className="rating">
              <span className="star">⭐</span>
              {data.average_rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 상세 소개, 리뷰, 추천 장소 / 여행 정보 (2단 Grid 레이아웃) */}
      <div className="detail-content-layout">
        {/* 2-A: 왼쪽 섹션 (소개, 리뷰, 추천) */}
        <div className="detail-left-section">
          {/* 여행 소개 섹션 */}
          <div className="travel-intro">
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
        <div className="detail-right-section travel-info-section">
          <h2>여행 정보</h2>

          <div className="info-item">
            <strong>위치</strong>
            <span>{data.place_address}</span>
          </div>

          <div className="info-item">
            <strong>적정 여행 기간</strong>
            <span>2박 3일 ~ 3박 4일 (임시)</span>
          </div>

          {/* 교통 정보 섹션 */}
          <h2>교통 정보</h2>
          <div className="info-item">
            <strong>항공편</strong>
            <span>인천/김포 공항 (임시)</span>
          </div>

          {/* 여행 계획 세우기 버튼 */}
          <div className="plan-button-container">
            <button className="plan-button">여행 계획 세우기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailPage;

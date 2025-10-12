// app/place/[placeId]/page.tsx
import RelatedPlacesSection from "@/component/place/RelatedPlacesSection";
import TravelReviewSection from "@/component/review/TravelReviewSection";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabaseClient";
import { TravelDetail } from "@/type/travel";

interface TravelDetailPageProps {
  params: Promise<{ placeId: string }>;
}

const TravelDetailPage = async ({ params }: TravelDetailPageProps) => {
  const { placeId } = await params;

  const supabase = createServerClient();

  const { data: dbData, error } = await supabase
    .from("place")
    .select("*")
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    console.error("DB 오류:", error);
    notFound();
  }
  if (!dbData) {
    notFound();
  }

  const data = dbData as TravelDetail;

  return (
    <div className="travel-app-container">
      <div
        className="cover-section"
        style={{ backgroundImage: `url(${data.place_detail_image})` }}
      >
        <div className="favorite-button">❤️</div>
        <div className="overlay-info">
          <h1>{data.place_name}</h1>
          <div className="subtitle-rating-line">
            <span className="subtitle">{data.place_address}</span>
            <span className="rating">
              <span className="star">⭐</span>
              {data.average_rating?.toFixed?.(1) ?? "0.0"}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-content-layout">
        <div className="detail-left-section">
          <div className="travel-intro">
            <h2>여행 소개</h2>
            <p>{data.place_description}</p>
          </div>

          <TravelReviewSection
            placeId={data.place_id}
            averageRating={data.average_rating ?? 0}
            reviewCount={data.favorite_count ?? 0}
          />

          <RelatedPlacesSection
            regionId={data.region_id}
            currentPlaceId={data.place_id}
          />
        </div>

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

          <h2>교통 정보</h2>
          <div className="info-item">
            <strong>항공편</strong>
            <span>인천/김포 공항 (임시)</span>
          </div>

          <div className="plan-button-container">
            <button className="plan-button">여행 계획 세우기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailPage;

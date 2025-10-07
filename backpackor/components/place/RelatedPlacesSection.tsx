"use client"; // ⭐️ 1. 클라이언트 컴포넌트임을 명시함 ⭐️

import React, { useEffect, useState } from "react";
// ⭐️ 2. useNavigate 대신 Next.js의 useRouter를 사용함 ⭐️
import { useRouter } from "next/navigation";

// 🚨 팀 프로젝트에 맞게 경로를 수정해야 합니다.
// 현재 구조상 'lib' 또는 'utils'에 타입이 있을 것으로 가정합니다.
import type { TravelSummary } from "@/lib/types/travel";
// import { supabase } from "@/lib/supabase/client"; // 실제 Supabase 경로로 변경 필요

// ----------------------------------------------------
// ⭐️ 목업 추천 장소 데이터 (유지) ⭐️
// ----------------------------------------------------
const MOCK_RELATED_PLACES: TravelSummary[] = [
  {
    place_id: "seongsan-ilchulbong",
    place_name: "성산일출봉",
    place_image: "https://picsum.photos/300/200?random=11",
    average_rating: 4.7,
  },
  {
    place_id: "hyeopjae-beach",
    place_name: "협재해수욕장",
    place_image: "https://picsum.photos/300/200?random=12",
    average_rating: 4.6,
  },
  {
    place_id: "hallasan",
    place_name: "한라산 국립공원",
    place_image: "https://picsum.photos/300/200?random=10",
    average_rating: 4.9,
  },
];

// ⭐️ 상위 컴포넌트(TravelDetailPage)로부터 props를 받습니다. ⭐️
interface RelatedPlacesSectionProps {
  currentPlaceId: string;
  regionId: number;
}

// ⭐️ 추천 장소 카드 컴포넌트 ⭐️
const RelatedPlaceCard: React.FC<TravelSummary> = (place) => {
  // ⭐️ 2. useNavigate -> useRouter.push()로 변경 ⭐️
  const router = useRouter();

  const handleClick = () => {
    // 클릭 시 해당 추천 장소의 상세 페이지로 이동
    // 기존: navigate(`/travel/${place.place_id}`);
    // Next.js: `app/place/[placeId]/page.tsx` 경로에 맞춰 /place/로 변경
    router.push(`/place/${place.place_id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: "30%",
        cursor: "pointer",
        padding: "10px",
        border: "1px solid #ddd",
      }}
    >
           {" "}
      <img
        src={place.place_image}
        alt={place.place_name}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          marginBottom: "10px",
        }}
      />
            <p style={{ fontWeight: "bold" }}>{place.place_name}</p>     {" "}
      <small>★ {place.average_rating.toFixed(1)}</small>   {" "}
    </div>
  );
};

const RelatedPlacesSection: React.FC<RelatedPlacesSectionProps> = (props) => {
  // ⭐️ 나머지 로직 (useState, useEffect)은 'use client'가 있으므로 그대로 유지함 ⭐️
  const [relatedPlaces, setRelatedPlaces] = useState<TravelSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... 데이터 페칭 로직 유지 ...
    const fetchRelatedPlaces = async () => {
      try {
        setLoading(true);
        setError(null); // ... 목업 데이터 사용 로직 ...
        await new Promise((resolve) => setTimeout(resolve, 300));
        setRelatedPlaces(MOCK_RELATED_PLACES); // 목업 데이터 사용
      } catch (err) {
        console.error("추천 장소 로드 실패:", err);
        setError("추천 장소를 불러오는 데 실패함.");
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedPlaces();
  }, [props.regionId, props.currentPlaceId]);

  if (loading) return <div>추천 장소를 로딩 중임...</div>;
  if (error) return <div style={{ color: "red" }}>오류: {error}</div>; // ... JSX 반환 로직 유지 ...

  if (relatedPlaces.length === 0) {
    return (
      <div style={{ padding: "20px", borderTop: "1px solid #ccc" }}>
                <h2>같이 가보면 좋을 장소</h2>       {" "}
        <p style={{ color: "#999" }}>같은 지역의 추천 장소가 아직 없음.</p>     {" "}
      </div>
    );
  }

  return (
    <section style={{ padding: "20px", borderTop: "1px solid #ccc" }}>
            <h2>같이 가보면 좋을 장소</h2>     {" "}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "15px",
        }}
      >
               {" "}
        {relatedPlaces.map((place) => (
          <RelatedPlaceCard key={place.place_id} {...place} />
        ))}
             {" "}
      </div>
         {" "}
    </section>
  );
};

export default RelatedPlacesSection;

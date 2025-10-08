"use client"; // ⭐️ 1. 클라이언트 컴포넌트임을 명시함 ⭐️

import React from "react";
// ⭐️ 2. useNavigate 대신 Next.js의 useRouter를 사용함 ⭐️
import { useRouter } from "next/navigation";
// 🚨 경로 별칭을 사용하여 타입 임포트 경로를 수정함
import type { TravelSummary } from "@/lib/type/travel";

interface TravelCardProps {
  place: TravelSummary;
}

const TravelCard: React.FC<TravelCardProps> = ({ place }) => {
  // ⭐️ 3. useNavigate 대신 useRouter를 선언함 ⭐️
  const router = useRouter();

  // ⭐️ 카드 클릭 이벤트 핸들러 ⭐️
  const handleClick = () => {
    // ⭐️ 4. 경로를 Next.js App Router 구조인 '/place/:placeId'로 변경함 ⭐️
    // 기존: navigate(`/travel/${place.place_id}`);
    router.push(`/place/${place.place_id}`);
  };

  return (
    <div
      className="travel-card"
      onClick={handleClick}
      // 스타일링이 필요하다면 여기에 추가 (예: 커서 포인터)
      style={{ cursor: "pointer" }}
    >
      <div
        className="card-image"
        style={{ backgroundImage: `url(${place.place_image})` }}
      />
      <div className="card-info">
        <h3>{place.place_name}</h3>
        <p>⭐️ {place.average_rating.toFixed(1)}</p>
      </div>
    </div>
  );
};

export default TravelCard;

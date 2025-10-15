"use client";

import { useState } from "react";
import Image from "next/image";
// PlannerEditor.tsx에서 사용하는 Place 타입을 가져옵니다.
// 이 Place 타입 정의에 place_address?: string; 이 포함되어 있는지 확인해야 합니다.
import type { Place } from "@/app/planner/edit/page";

interface EditorPlaceCardProps {
  place: Place;
  onAddPlace: (place: Place) => void;
}

export default function EditorPlaceCard({
  place,
  onAddPlace,
}: EditorPlaceCardProps) {
  const [imgSrc, setImgSrc] = useState(place.place_image);
  console.log(place);
  // [수정된 핵심 로직]
  // place 객체의 place_address 값을 기반으로 지역명을 추출합니다.
  // place_address가 '서울 강남구 ...' 라면 '서울'을, 없다면 '지역 정보 없음'을 표시합니다.
  const region = place.place_address?.split(" ")[0] || "지역 정보 없음";

  // "추가" 버튼 클릭 시 부모로부터 받은 onAddPlace 함수를 호출합니다.
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 전체로 이벤트가 전파되는 것을 막습니다.
    onAddPlace(place);
  };

  return (
    // 'group' 클래스를 이용해 카드에 마우스를 올렸을 때(hover) 내부 요소의 스타일을 제어합니다.
    <div className="travel-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col relative group">
      {/* 이미지 섹션 */}
      <div className="relative w-full aspect-video">
        <Image
          src={imgSrc || "/default-image.png"}
          alt={place.place_name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 50vw, 25vw"
          priority
          onError={() => setImgSrc("/default-image.png")}
        />
        {/* 호버 시 나타나는 "추가" 버튼 오버레이 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-white text-blue-500 font-bold rounded-full hover:bg-blue-50 transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="card-info p-4 flex-grow flex flex-col">
        <h3 className="text-base font-bold mb-1 truncate">
          {place.place_name}
        </h3>
        {/* 추출된 지역명을 화면에 표시합니다. */}
        <p className="text-sm text-gray-600 mb-2">{region}</p>
        <div className="mt-auto flex justify-between items-center">
          <p className="flex items-center text-sm font-semibold">
            <svg
              className="w-5 h-5 text-yellow-400 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753 .392c.83.069 1.171 1.107 .536 1.651l-3.62 3.102 1.07 4.632c.181 .79-.702 1.4-1.437 1.016L12 16.205l-4.118 2.593c-.735.384-1.618-.226-1.437-1.016l1.07-4.632L3.29 8.928c-.635-.544-.294-1.582.536-1.651l4.753-.392l1.83-4.401Z" />
            </svg>
            {place.average_rating?.toFixed(1) || "0.0"}
          </p>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-red-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>{place.favorite_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

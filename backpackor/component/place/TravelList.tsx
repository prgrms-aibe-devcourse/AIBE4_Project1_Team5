"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// [수정!] 실제 DB 구조에 맞게 타입 재정의 (region_id 삭제, place_address 추가)
export interface Place {
  place_id: string;
  place_name: string;
  place_address: string; // 주소 컬럼 추가
  place_description: string;
  average_rating: number;
  place_image: string;
  favorite_count: number;
}

// [삭제!] REGION_MAP은 더 이상 필요 없으므로 삭제합니다.

// --- 지역 필터 드롭다운에 표시할 목록 ---
const REGIONS = [
  "전체",
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

// --- 여행지 카드 UI 컴포넌트 ---
const TravelCard = ({ destination }: { destination: Place }) => {
  const [imgSrc, setImgSrc] = useState(destination.place_image);

  return (
    <Link
      href={`/place/${destination.place_id}`}
      className="travel-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative w-full aspect-video">
        <Image
          src={imgSrc || "/default-image.png"}
          alt={destination.place_name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          onError={() => {
            setImgSrc("/default-image.png");
          }}
        />
      </div>
      <div className="card-info p-4">
        <h3 className="text-lg font-bold mb-1">{destination.place_name}</h3>
        <p className="text-sm text-gray-600 mb-2 h-10 overflow-hidden">
          {destination.place_description}
        </p>
        <p className="flex items-center text-sm font-semibold">
          <svg
            className="w-5 h-5 text-yellow-400 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.392c.83.069 1.171 1.107.536 1.651l-3.62 3.102 1.07 4.632c.181.79-.702 1.4-1.437 1.016L12 16.205l-4.118 2.593c-.735.384-1.618-.226-1.437-1.016l1.07-4.632L3.29 8.928c-.635-.544-.294-1.582.536-1.651l4.753-.392l1.83-4.401Z" />
          </svg>
          {destination.average_rating}
        </p>
      </div>
    </Link>
  );
};

// --- '여행지 목록' 페이지의 메인 컴포넌트 ---
export default function TravelList({
  initialPlaces,
}: {
  initialPlaces: Place[];
}) {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredDestinations = initialPlaces.filter((dest) => {
    // [수정 완료!] 주소(place_address)에 선택한 지역명이 포함되어 있는지 확인하는 방식으로 변경
    const regionMatch =
      selectedRegion === "전체" ||
      (dest.place_address && dest.place_address.includes(selectedRegion));
    const favoriteMatch = !showFavoritesOnly || dest.favorite_count > 0;
    return regionMatch && favoriteMatch;
  });

  return (
    <main className="travel-app-container max-w-6xl mx-auto px-4 py-8">
      {/* ... 이하 JSX 코드는 모두 동일 ... */}
      <h1 className="text-3xl font-bold mb-2">여행지 둘러보기</h1>
      <p className="text-gray-600 mb-6">
        대한민국의 아름다운 여행지들을 탐색해보세요.
      </p>
      <div className="flex justify-between items-center my-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="px-4 py-2 text-sm font-semibold border rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" />
              </svg>
              {selectedRegion === "전체" ? "지역별 필터" : selectedRegion}
            </button>
            {isRegionDropdownOpen && (
              <ul className="absolute z-10 mt-1 w-48 bg-white border rounded-md shadow-lg">
                {REGIONS.map((region) => (
                  <li
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setIsRegionDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {region}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="rounded"
            />
            찜한 여행지
          </label>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold cursor-pointer hover:text-black">
            가나다순
          </span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer hover:text-black">리뷰많은순</span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer hover:text-black">별점높은순</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest) => (
          <TravelCard key={dest.place_id} destination={dest} />
        ))}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Sort from "./Sort"; // Sort 컴포넌트를 import 합니다.

// Place 타입 인터페이스
export interface Place {
  place_id: string;
  place_name: string;
  place_address: string;
  place_description: string;
  average_rating: number;
  place_image: string;
  favorite_count: number;
  review_count: number;
}

// 지역 상수 배열
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

// TravelCard 컴포넌트
const TravelCard = ({ destination }: { destination: Place }) => {
  const [imgSrc, setImgSrc] = useState(destination.place_image);
  const region = destination.place_address?.split(" ")[0] || "지역 정보 없음";

  return (
    <Link
      href={`/place/${destination.place_id}`}
      className="travel-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      <div className="relative w-full aspect-video">
        <Image
          src={imgSrc || "/default-image.png"}
          alt={destination.place_name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          onError={() => setImgSrc("/default-image.png")}
        />
      </div>
      <div className="card-info p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold mb-1">{destination.place_name}</h3>
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
            {destination.average_rating.toFixed(1)}
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
            <span>{destination.favorite_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function TravelList({
  initialPlaces,
}: {
  initialPlaces: Place[];
}) {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "popularity_desc";
  const [visibleCount, setVisibleCount] = useState(18);

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    router.push(`?${params.toString()}`);
  };

  const filteredDestinations = initialPlaces.filter((dest) => {
    const regionMatch =
      selectedRegion === "전체" ||
      (dest.place_address && dest.place_address.includes(selectedRegion));
    const favoriteMatch = !showFavoritesOnly || dest.favorite_count > 0;
    return regionMatch && favoriteMatch;
  });

  return (
    <main className="travel-app-container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">여행지 둘러보기</h1>
      <p className="text-gray-600 mb-6">
        대한민국의 아름다운 여행지들을 탐색해보세요.
      </p>

      <div className="flex justify-between items-center my-6">
        {/* [복구] 지역별 필터 및 찜하기 UI */}
        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="px-4 py-2 text-sm font-semibold border rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8.75Z" />
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

        <Sort currentSort={currentSort} onSortChange={handleSortChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.slice(0, visibleCount).map((dest) => (
          <TravelCard key={dest.place_id} destination={dest} />
        ))}
      </div>

      {visibleCount < filteredDestinations.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prevCount) => prevCount + 18)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            더보기
          </button>
        </div>
      )}
    </main>
  );
}

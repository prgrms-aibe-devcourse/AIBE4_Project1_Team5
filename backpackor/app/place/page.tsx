// app/place/page.tsx

"use client"; // <--- 페이지를 클라이언트 컴포넌트로 전환하는 코드 (가장 중요!)

import { useState } from "react"; // useState 기능을 불러옵니다.
import Link from "next/link";

// --- 페이지에 표시할 임시 데이터 ---
const DUMMY_DESTINATIONS = [
  {
    id: "jeju",
    name: "제주도",
    region: "제주특별자치도",
    description: "아름다운 자연경관과 독특한 문화를 가진 섬",
    rating: 4.8,
    isFavorite: true, // 찜 여부 데이터 추가
    imageUrl:
      "https://images.unsplash.com/photo-1598135753163-6167c1a1ad2b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "busan",
    name: "부산",
    region: "부산광역시",
    description: "바다와 산이 어우러진 국제적인 해양도시",
    rating: 4.6,
    isFavorite: false,
    imageUrl:
      "https://images.unsplash.com/photo-1599819108386-7f45b5b5c1f3?q=80&w=1932&auto=format&fit=crop",
  },
  // ... (다른 여행지 데이터 추가)
  {
    id: "seoul",
    name: "서울",
    region: "서울특별시",
    description: "전통과 현대가 공존하는 대한민국의 수도",
    rating: 4.5,
    isFavorite: false,
    imageUrl:
      "https://images.unsplash.com/photo-1543812435-f553b3da146b?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "gangneung",
    name: "강릉",
    region: "강원도",
    description: "푸른 동해와 커피 향이 가득한 도시",
    rating: 4.7,
    isFavorite: true,
    imageUrl:
      "https://images.unsplash.com/photo-1626042434844-88373b578b98?q=80&w=1964&auto-format&fit=crop",
  },
];

// --- 지역 필터에 사용할 시/도 목록 ---
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
const TravelCard = ({
  destination,
}: {
  destination: (typeof DUMMY_DESTINATIONS)[0];
}) => {
  return (
    <Link href={`/place/${destination.id}`} className="travel-card">
      <div
        className="card-image"
        style={{ backgroundImage: `url(${destination.imageUrl})` }}
      ></div>
      <div className="card-info">
        <h3>{destination.name}</h3>
        <p>{destination.description}</p>
        <p className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-yellow-400 mr-1"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753.392c.83.069 1.171 1.107.536 1.651l-3.62 3.102 1.07 4.632c.181.79-.702 1.4-1.437 1.016L12 16.205l-4.118 2.593c-.735.384-1.618-.226-1.437-1.016l1.07-4.632L3.29 8.928c-.635-.544-.294-1.582.536-1.651l4.753-.392l1.83-4.401Z"
              clipRule="evenodd"
            />
          </svg>
          {destination.rating}
        </p>
      </div>
    </Link>
  );
};

// --- '여행지 목록' 페이지의 메인 컴포넌트 ---
export default function TravelListPage() {
  // 필터 상태를 관리하기 위한 useState
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 선택된 필터에 따라 여행지 목록을 필터링
  const filteredDestinations = DUMMY_DESTINATIONS.filter((dest) => {
    const regionMatch =
      selectedRegion === "전체" || dest.region === selectedRegion;
    const favoriteMatch = !showFavoritesOnly || dest.isFavorite;
    return regionMatch && favoriteMatch;
  });

  return (
    <main className="travel-app-container">
      <h1>여행지 둘러보기</h1>
      <p>대한민국의 아름다운 여행지들을 탐색해보세요.</p>

      <div className="flex justify-between items-center my-6">
        {/* 필터 섹션 */}
        <div className="flex gap-2 items-center">
          {/* 지역별 필터 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="px-4 py-2 text-sm font-semibold border rounded-full flex items-center gap-2 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              지역별 필터
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

          {/* 찜한 여행지 체크박스 */}
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

        {/* 정렬 섹션 */}
        <div className="text-sm text-gray-600">
          <span>정렬: </span>
          <span className="font-semibold cursor-pointer hover:text-black">
            가나다순
          </span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer hover:text-black">리뷰많은순</span>
          <span className="mx-2">|</span>
          <span className="cursor-pointer hover:text-black">별점높은순</span>
        </div>
      </div>

      <div className="travel-list-grid">
        {filteredDestinations.map((dest) => (
          <TravelCard key={dest.id} destination={dest} />
        ))}
      </div>
    </main>
  );
}

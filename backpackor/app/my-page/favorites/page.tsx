"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PlaceGrid } from "@/components/place/list/PlaceGrid";
import { RegionFilter } from "@/components/common/filter/RegionFilter";
import {
  PLACE_SORT_OPTIONS,
  SortOptions,
} from "@/components/common/filter/SortOptions";
import { getFavoritePlaces } from "@/apis/placeApi";
import type { Place } from "@/types/place";

export default function MyFavoritesPage() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [currentSort, setCurrentSort] = useState("popularity_desc");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchFavoritePlaces = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        // placeApi의 getFavoritePlaces 사용 (정렬 기준 동일)
        const favoritePlaces = await getFavoritePlaces(user.id, currentSort);
        setPlaces(favoritePlaces);
      } catch (error) {
        console.error("찜한 장소 조회 오류:", error);
        alert("찜한 장소를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritePlaces();
  }, [user?.id, currentSort]);

  // 필터링된 장소 목록 (정렬은 이미 API에서 처리됨)
  const displayPlaces = useMemo(() => {
    let result = [...places];

    // 지역 필터링
    if (selectedRegionId !== null) {
      result = result.filter((place) => place.region_id === selectedRegionId);
    }

    // 검색 필터링
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((place) =>
        place.place_name.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [places, selectedRegionId, searchKeyword]);

  if (!user) {
    return <LoadingSpinner fullScreen message="사용자 정보를 불러오는 중..." />;
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="찜한 장소를 불러오는 중..." />;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">찜한 장소</h1>
        <p className="text-gray-600">
          {places.length > 0
            ? `총 ${places.length}개의 여행지를 저장했습니다.`
            : "아직 찜한 장소가 없습니다."}
        </p>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">찜한 장소가 없습니다.</p>
          <p className="text-gray-400 text-sm">
            여행지를 둘러보고 마음에 드는 곳을 저장해보세요.
          </p>
        </div>
      ) : (
        <>
          {/* 검색 및 필터 영역 */}
          <div className="mb-6 space-y-4">
            {/* 검색창 */}
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="여행지 이름을 검색하세요"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* 필터 및 정렬 */}
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm gap-4">
              <RegionFilter
                selectedRegionId={selectedRegionId}
                onRegionChange={setSelectedRegionId}
              />
              <SortOptions
                currentSort={currentSort}
                options={PLACE_SORT_OPTIONS}
                onSortChange={setCurrentSort}
              />
            </div>
          </div>

          {/* 장소 목록 */}
          {displayPlaces.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">
                조건에 맞는 장소가 없습니다.
              </p>
              <p className="text-gray-400 text-sm">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          ) : (
            <PlaceGrid places={displayPlaces} showFavoritesOnly={true} />
          )}
        </>
      )}
    </main>
  );
}

// 여행지 리스트 컨테이너 (리뷰, 플래너에서 사용)
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Place } from "@/types/place";
import { usePlaceRealtime } from "@/hooks/place/usePlaceRealtime";
import { useTravelListFavorites } from "@/hooks/place/useTravelListFavorites";
import { TravelListItem } from "../card/TravelListItem";
import { RegionFilter } from "@/components/common/filter/RegionFilter";

interface TravelListContainerProps {
  places: Place[];
  onAddPlace: (place: Place) => void;
  onPlaceClick: (placeId: string) => void;
  regionIds?: number[];
  initialRegionId?: number | null;
}

const INITIAL_ITEM_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function TravelListContainer({
  places,
  onAddPlace,
  onPlaceClick,
  regionIds = [],
  initialRegionId = null,
}: TravelListContainerProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("popularity_desc");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEM_COUNT);
  // regionIds가 있으면 첫 번째 값으로 초기화, 없으면 initialRegionId 사용
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    regionIds.length > 0 ? regionIds[0] : initialRegionId
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const updatedPlaces = usePlaceRealtime(places);
  const { isLoading: isLoadingFavorites, favoritePlaceIds } =
    useTravelListFavorites();

  // 필터링 및 정렬
  const displayPlaces = useMemo(() => {
    let filtered = [...updatedPlaces];

    // 찜 필터
    if (showFavoritesOnly) {
      filtered = filtered.filter((place) =>
        favoritePlaceIds.has(place.place_id)
      );
    }

    // 지역 필터
    if (selectedRegionId !== null) {
      filtered = filtered.filter(
        (place) => place.region_id === selectedRegionId
      );
    }

    // 정렬
    const sorted = filtered.sort((a, b) => {
      switch (sortOrder) {
        case "reviews_desc":
          // 리뷰많은순
          return (b.review_count || 0) - (a.review_count || 0);
        case "rating_desc":
          // 별점높은순
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "popularity_desc":
        default:
          // 인기순 = 리뷰 개수 + 찜 개수 + 평점
          const scoreA = (a.review_count || 0) + (a.favorite_count || 0) + (a.average_rating || 0);
          const scoreB = (b.review_count || 0) + (b.favorite_count || 0) + (b.average_rating || 0);
          return scoreB - scoreA;
      }
    });

    // 검색 필터
    if (!searchKeyword) {
      return sorted;
    }

    return sorted.filter((place) =>
      place.place_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [
    updatedPlaces,
    sortOrder,
    searchKeyword,
    selectedRegionId,
    showFavoritesOnly,
    favoritePlaceIds,
  ]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">여행지 둘러보기</h2>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="popularity_desc">인기순</option>
          <option value="rating_desc">별점높은순</option>
          <option value="reviews_desc">리뷰많은순</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <RegionFilter
          selectedRegionId={selectedRegionId}
          onRegionChange={setSelectedRegionId}
          className="flex-1"
          allowedRegionIds={regionIds.length > 0 ? regionIds : undefined}
        />
        <div className="flex items-center shrink-0">
          <input
            type="checkbox"
            id="favorites-checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            disabled={isLoadingFavorites}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
          <label
            htmlFor="favorites-checkbox"
            className={`ml-2 text-sm font-medium text-gray-900 ${
              isLoadingFavorites ? "text-gray-400" : ""
            }`}
          >
            찜한 여행지
          </label>
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="장소명 검색"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Early return: 로딩 중 */}
        {isLoadingFavorites ? (
          <div className="text-center py-12 text-gray-500">
            찜 목록을 확인하는 중...
          </div>
        ) : displayPlaces.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {showFavoritesOnly
              ? "찜한 여행지가 없습니다."
              : "조건에 맞는 여행지가 없습니다."}
          </div>
        ) : (
          <>
            {displayPlaces.slice(0, visibleCount).map((place) => (
              <TravelListItem
                key={place.place_id}
                place={place}
                onPlaceClick={onPlaceClick}
                onAddPlace={onAddPlace}
              />
            ))}
            {visibleCount < displayPlaces.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  더보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

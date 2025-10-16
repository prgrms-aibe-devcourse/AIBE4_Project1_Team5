// component/place/TravelListContainer.tsx

"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Place } from "@/component/planner/PlannerEditor";
import { createBrowserClient } from "@/lib/supabaseClient";

interface TravelListContainerProps {
  places: Place[];
  onAddPlace: (place: Place) => void;
  onPlaceClick: (placeId: string) => void;
  regionOptions: string[];
}

const INITIAL_ITEM_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function TravelListContainer({
  places,
  onAddPlace,
  onPlaceClick,
  regionOptions,
}: TravelListContainerProps) {
  const supabase = createBrowserClient();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("popularity_desc");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEM_COUNT);

  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<string>>(
    new Set()
  );

  // ✅ 수정: showFavoritesOnly가 true일 때만 fetch
  useEffect(() => {
    if (!showFavoritesOnly) return; // false면 아무것도 안 함

    const fetchFavorites = async () => {
      // ⚠️ 실제 사용자의 ID를 가져오는 로직이 필요합니다.
      const userId = "USER_ID_PLACEHOLDER";
      if (!userId) return;

      const { data, error } = await supabase
        .from("user_favorite_place")
        .select("place_id")
        .eq("user_id", userId);

      if (error) {
        console.error("찜 목록 조회 실패:", error);
      } else if (data) {
        setFavoritePlaceIds(new Set(data.map((item) => item.place_id)));
      }
    };

    fetchFavorites();
  }, [showFavoritesOnly, supabase]);

  const displayPlaces = useMemo(() => {
    let filteredPlaces = [...places];

    // ✅ 찜한 여행지 필터링
    if (showFavoritesOnly && favoritePlaceIds.size > 0) {
      filteredPlaces = filteredPlaces.filter((place) =>
        favoritePlaceIds.has(place.place_id)
      );
    }

    // 지역 필터링
    if (selectedRegion !== "전체") {
      filteredPlaces = filteredPlaces.filter(
        (place) => place.region === selectedRegion
      );
    }

    // 정렬
    const sorted = filteredPlaces.sort((a, b) => {
      switch (sortOrder) {
        case "review_desc":
          return (b.review_count || 0) - (a.review_count || 0);
        case "rating_desc":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "popularity_desc":
        default:
          return (b.favorite_count || 0) - (a.favorite_count || 0);
      }
    });

    // 검색 필터링
    if (!searchKeyword) return sorted;
    return sorted.filter((place) =>
      place.place_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [
    places,
    sortOrder,
    searchKeyword,
    selectedRegion,
    showFavoritesOnly,
    favoritePlaceIds,
  ]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + LOAD_MORE_COUNT);
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
          <option value="rating_desc">평점순</option>
          <option value="review_desc">리뷰순</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="전체">전체</option>
          {regionOptions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <div className="flex items-center shrink-0">
          <input
            type="checkbox"
            id="favorites-checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="favorites-checkbox"
            className="ml-2 text-sm font-medium text-gray-900"
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
        {displayPlaces.length > 0 ? (
          <>
            {displayPlaces.slice(0, visibleCount).map((place) => (
              <div
                key={place.place_id}
                onClick={() => onPlaceClick(place.place_id)}
                className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {place.place_image && (
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <Image
                        src={place.place_image}
                        alt={place.place_name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {place.place_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {place.region}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span>⭐ {place.average_rating?.toFixed(1) ?? "-"}</span>
                      <span>❤️ {place.favorite_count ?? 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPlace(place);
                    }}
                    className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                    title="일정에 추가"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            {showFavoritesOnly
              ? "찜한 여행지가 없습니다."
              : "조건에 맞는 여행지가 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Place } from "@/component/planner/PlannerEditor";

interface TravelListContainerProps {
  places: Place[];
  onAddPlace: (place: Place) => void;
  onPlaceClick?: (placeId: string) => void;
}

const INITIAL_ITEM_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function TravelListContainer({
  places,
  onAddPlace,
  onPlaceClick,
}: TravelListContainerProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("popularity_desc");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEM_COUNT);

  const displayPlaces = useMemo(() => {
    const sorted = [...places].sort((a, b) => {
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

    if (!searchKeyword) return sorted;
    return sorted.filter((place) =>
      place.place_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [places, sortOrder, searchKeyword]);

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
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity_desc">인기순</option>
          <option value="rating_desc">평점순</option>
          <option value="review_desc">리뷰순</option>
        </select>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="장소명 검색"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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

      {/* 장소 목록 */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {displayPlaces.length > 0 ? (
          displayPlaces.slice(0, visibleCount).map((place) => (
            <div
              key={place.place_id}
              className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* 장소 이미지 + 정보 (클릭시 모달) */}
                <button
                  onClick={() => onPlaceClick?.(place.place_id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
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
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {place.average_rating?.toFixed(1) ?? "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {place.favorite_count ?? 0}
                      </span>
                    </div>
                  </div>
                </button>

                {/* 추가 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddPlace(place);
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                  title="일정에 추가"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
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
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
            <p>검색 결과가 없습니다</p>
          </div>
        )}

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
      </div>
    </div>
  );
}

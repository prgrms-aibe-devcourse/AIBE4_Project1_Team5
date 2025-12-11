// 여행지 리스트 컨테이너 (리뷰, 플래너에서 사용)
"use client";

import { useState, useEffect } from "react";
import type { Place } from "@/types/place";
import { useTravelListFavorites } from "@/hooks/place/useTravelListFavorites";
import { TravelListItem } from "../card/TravelListItem";
import { RegionFilter } from "@/components/common/filter/RegionFilter";
import { getAllPlaces, searchPlaces, getFavoritePlaces } from "@/apis/placeApi";
import { useAuth } from "@/hooks/auth/useAuth";

interface TravelListContainerProps {
  places: Place[];
  onAddPlace: (place: Place) => void;
  onPlaceClick: (placeId: string) => void;
  regionIds?: number[];
  initialRegionId?: number | null;
}

const PAGE_SIZE = 10;

export default function TravelListContainer({
  places,
  onAddPlace,
  onPlaceClick,
  regionIds = [],
  initialRegionId = null,
}: TravelListContainerProps) {
  const { user } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // regionIds가 있으면 첫 번째 값으로 초기화, 없으면 initialRegionId 사용
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    regionIds.length > 0 ? regionIds[0] : initialRegionId
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { isLoading: isLoadingFavorites, favoritePlaceIds } =
    useTravelListFavorites();

  // 필터 변경 시 초기화
  useEffect(() => {
    setCurrentPage(1);
    setDisplayPlaces([]);
    setHasMore(true);
  }, [sortOrder, selectedRegionId, searchKeyword, showFavoritesOnly]);

  // 데이터 로드
  useEffect(() => {
    const fetchPlaces = async () => {
      if (currentPage === 1) {
        setIsLoadingMore(true);
      }

      try {
        let fetchedPlaces: Place[] = [];

        // 필터 조건
        const filters = {
          searchQuery: searchKeyword || undefined,
          regionId: selectedRegionId || undefined,
        };

        const hasFilters = searchKeyword || selectedRegionId;

        if (showFavoritesOnly) {
          // 찜한 여행지
          if (!user) {
            setDisplayPlaces([]);
            setHasMore(false);
            return;
          }
          fetchedPlaces = await getFavoritePlaces(user.id, sortOrder, filters);
          // 찜 목록은 페이지네이션 없이 전체 로드
          if (currentPage === 1) {
            setDisplayPlaces(fetchedPlaces);
          }
          setHasMore(false);
        } else {
          // 일반 여행지 목록
          if (hasFilters) {
            fetchedPlaces = await searchPlaces(filters, sortOrder, currentPage, PAGE_SIZE);
          } else {
            fetchedPlaces = await getAllPlaces(sortOrder, currentPage, PAGE_SIZE);
          }

          if (currentPage === 1) {
            setDisplayPlaces(fetchedPlaces);
          } else {
            setDisplayPlaces((prev) => [...prev, ...fetchedPlaces]);
          }

          // 더 가져올 데이터가 있는지 확인
          setHasMore(fetchedPlaces.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("여행지 목록 로드 오류:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };

    fetchPlaces();
  }, [currentPage, sortOrder, selectedRegionId, searchKeyword, showFavoritesOnly, user]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
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
          <option value="popularity">인기순</option>
          <option value="rating">별점높은순</option>
          <option value="reviews">리뷰많은순</option>
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
        {/* 로딩 중 */}
        {isLoadingFavorites || (isLoadingMore && currentPage === 1) ? (
          <div className="text-center py-12 text-gray-500">
            {isLoadingFavorites ? "찜 목록을 확인하는 중..." : "여행지를 불러오는 중..."}
          </div>
        ) : displayPlaces.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {showFavoritesOnly
              ? "찜한 여행지가 없습니다."
              : "조건에 맞는 여행지가 없습니다."}
          </div>
        ) : (
          <>
            {displayPlaces.map((place) => (
              <TravelListItem
                key={place.place_id}
                place={place}
                onPlaceClick={onPlaceClick}
                onAddPlace={onAddPlace}
              />
            ))}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? "불러오는 중..." : "더보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

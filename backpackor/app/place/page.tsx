"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { RegionFilter } from "@/components/common/filter/RegionFilter";
import { SortOptions, PLACE_SORT_OPTIONS } from "@/components/common/filter/SortOptions";
import { PlaceGrid } from "@/components/place/list/PlaceGrid";
import { Pagination } from "@/components/common/Pagination";
import { usePlaces } from "@/hooks/place/usePlaces";
import { usePlaceFilters } from "@/hooks/place/usePlaceFilters";

function PlacePageContent() {
  const {
    currentSort,
    showFavoritesOnly,
    selectedRegionId,
    searchKeyword,
    handleRegionChange,
    handleSortChange,
    handleFavoriteToggle,
    handleSearchChange,
  } = usePlaceFilters();

  const [currentPage, setCurrentPage] = useState(1);

  // 서버 사이드 필터링
  const filters = useMemo(() => ({
    searchQuery: searchKeyword || undefined,
    regionId: selectedRegionId || undefined,
  }), [searchKeyword, selectedRegionId]);

  const {
    places,
    isLoading,
    totalPages
  } = usePlaces({
    sortBy: currentSort,
    showFavoritesOnly,
    filters,
    page: currentPage,
    limit: 15
  });

  // 필터나 정렬이 변경되면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSort, showFavoritesOnly, filters]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Early return: 로딩 중
  if (isLoading) {
    return <LoadingSpinner fullScreen message="여행지를 불러오는 중..." />;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">여행지 둘러보기</h1>
      <p className="text-gray-600 mb-6">
        대한민국의 아름다운 여행지들을 탐색해보세요.
      </p>

      {/* 검색창 */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="여행지 이름을 검색하세요"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* 필터 & 정렬 */}
      <div className="flex justify-between items-center my-6">
        <div className="flex gap-4 items-center">
          <RegionFilter
            selectedRegionId={selectedRegionId}
            onRegionChange={handleRegionChange}
          />
          {/* 찜 필터 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={handleFavoriteToggle}
              className="rounded"
            />
            찜한 여행지
          </label>
        </div>
        <SortOptions
          currentSort={currentSort}
          options={PLACE_SORT_OPTIONS}
          onSortChange={handleSortChange}
        />
      </div>

      {/* 여행지 그리드 */}
      <PlaceGrid places={places} showFavoritesOnly={showFavoritesOnly} />

      {/* 페이지네이션 */}
      {!showFavoritesOnly && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </main>
  );
}

export default function PlacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PlacePageContent />
    </Suspense>
  );
}

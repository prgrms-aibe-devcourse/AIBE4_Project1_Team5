"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { RegionFilter } from "@/components/common/filter/RegionFilter";
import { SortOptions, PLACE_SORT_OPTIONS } from "@/components/common/filter/SortOptions";
import { PlaceGrid } from "@/components/place/list/PlaceGrid";
import { Pagination } from "@/components/common/Pagination";
import { usePlaces } from "@/hooks/place/usePlaces";
import { usePlaceFilters } from "@/hooks/place/usePlaceFilters";

function PlacePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentSort,
    showFavoritesOnly,
    selectedRegionId,
    searchInput,
    searchKeyword,
    handleRegionChange,
    handleSortChange,
    handleFavoriteToggle,
    handleSearchChange,
  } = usePlaceFilters();

  const [currentPage, setCurrentPage] = useState(() => {
    // URL 파라미터에서 페이지 번호를 확인
    const pageFromUrl = searchParams.get("page");
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        return pageNum;
      }
    }

    // 세션 스토리지에서 저장된 페이지 복원
    if (typeof window !== "undefined") {
      const savedPage = sessionStorage.getItem("place_list_page");
      return savedPage ? parseInt(savedPage, 10) : 1;
    }
    return 1;
  });

  // 현재 표시 가능한 최대 페이지 (100페이지씩 증가)
  const [maxVisiblePages, setMaxVisiblePages] = useState(100);

  // 초기 렌더링 체크
  const [isInitialMount, setIsInitialMount] = useState(true);

  // 이전 필터 값 추적
  const [prevFilters, setPrevFilters] = useState<{searchQuery?: string, regionId?: number}>({});

  // 초기 로드 시 URL에 page 파라미터가 없으면 추가
  useEffect(() => {
    const pageFromUrl = searchParams.get("page");
    const params = new URLSearchParams(searchParams.toString());

    if (!pageFromUrl) {
      // URL에 page가 없으면 currentPage를 URL에 반영
      params.set("page", currentPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      // 세션 스토리지에도 저장
      sessionStorage.setItem("place_list_page", currentPage.toString());
    } else {
      // URL에 page가 있으면 currentPage를 URL에 맞춤
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== currentPage) {
        setCurrentPage(pageNum);
        // 세션 스토리지에도 저장
        sessionStorage.setItem("place_list_page", pageNum.toString());
      }
    }
  }, []);

  // URL 파라미터 변경 시 currentPage 동기화
  useEffect(() => {
    const pageFromUrl = searchParams.get("page");

    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== currentPage) {
        setCurrentPage(pageNum);
        // 세션 스토리지에도 저장
        sessionStorage.setItem("place_list_page", pageNum.toString());
      }
    }
  }, [searchParams]);

  // 100페이지 초과 시 다음 청크 로드 및 maxVisiblePages 확장
  useEffect(() => {
    if (currentPage > maxVisiblePages) {
      // 다음 100페이지 범위로 확장
      setMaxVisiblePages(prev => prev + 100);
    }
  }, [currentPage, maxVisiblePages]);

  // 컴포넌트 언마운트 시 세션 스토리지 초기화 (여행지 섹션 벗어날 때만)
  useEffect(() => {
    return () => {
      // 언마운트될 때 현재 URL을 확인
      // /place로 시작하지 않는 페이지로 이동하는 경우에만 초기화
      // (여행지 상세 페이지 /place/{id}는 유지)
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/place')) {
        sessionStorage.setItem("place_list_page", "1");
      }
    };
  }, []);

  // 서버 사이드 필터링
  const filters = useMemo(() => ({
    searchQuery: searchKeyword || undefined,
    regionId: selectedRegionId || undefined,
  }), [searchKeyword, selectedRegionId]);

  // 필터가 있는지 확인
  const hasFilters = !!(searchKeyword || selectedRegionId);

  // 초기 마운트 후 플래그 설정 및 초기 필터 값 저장
  useEffect(() => {
    // 초기 필터 값을 prevFilters에 저장
    setPrevFilters(filters);

    // 컴포넌트가 마운트된 후 약간의 지연을 두고 false로 설정
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const {
    places,
    isLoading,
    totalPages,
    totalCount
  } = usePlaces({
    sortBy: currentSort,
    showFavoritesOnly,
    filters,
    page: currentPage,
    limit: 15
  });

  // 필터나 정렬이 변경되면 페이지를 1로 리셋 (초기 렌더링 제외)
  useEffect(() => {
    // 초기 마운트가 아닐 때만 실행 (실제 사용자가 필터를 변경한 경우)
    if (!isInitialMount) {
      // 실제로 필터 값이 변경되었는지 확인
      const filterChanged =
        prevFilters.searchQuery !== filters.searchQuery ||
        prevFilters.regionId !== filters.regionId;

      if (filterChanged) {
        setCurrentPage(1);

        // URL 업데이트 (검색어 유지)
        const params = new URLSearchParams();
        params.set("page", "1");
        if (searchKeyword) {
          params.set("search", searchKeyword);
        }
        if (currentSort && currentSort !== "popularity") {
          params.set("sort", currentSort);
        }
        if (showFavoritesOnly) {
          params.set("favorite", "true");
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        sessionStorage.setItem("place_list_page", "1");
      }

      // 이전 필터 값 업데이트
      setPrevFilters(filters);
    }
  }, [currentSort, showFavoritesOnly, filters, isInitialMount, pathname, router, searchKeyword]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // URL 업데이트 (기존 파라미터 유지)
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // 세션 스토리지에 페이지 저장
    sessionStorage.setItem("place_list_page", page.toString());
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
          value={searchInput}
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
      {!showFavoritesOnly && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          maxVisiblePages={hasFilters ? totalPages : Math.min(maxVisiblePages, totalPages)}
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

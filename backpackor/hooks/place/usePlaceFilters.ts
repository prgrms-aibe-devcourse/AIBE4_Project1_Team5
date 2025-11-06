// 여행지 필터 관리 훅
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STORAGE_KEY_REGION = "place_filter_region_id";
const STORAGE_KEY_SEARCH = "place_filter_search_keyword";
const STORAGE_KEY_SORT = "place_filter_sort";
const STORAGE_KEY_FAVORITE = "place_filter_favorite";

export const usePlaceFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 초기값: URL > sessionStorage 순으로 확인
  const currentSort = searchParams.get("sort") ||
    (typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY_SORT) : null) ||
    "popularity";

  const showFavoritesOnly = searchParams.get("favorite") === "true" ||
    (typeof window !== "undefined" && !searchParams.get("favorite")
      ? sessionStorage.getItem(STORAGE_KEY_FAVORITE) === "true"
      : false);

  // region_id 기반으로 변경 (null = 전체)
  // 초기값: URL > sessionStorage 순으로 확인
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const urlRegion = searchParams.get("region");
      if (urlRegion) {
        const regionId = parseInt(urlRegion, 10);
        if (!isNaN(regionId)) return regionId;
      }
      const stored = sessionStorage.getItem(STORAGE_KEY_REGION);
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  // 검색 키워드 - 입력 중인 값 (즉시 반영)
  // 초기값: URL > sessionStorage 순으로 확인
  const [searchInput, setSearchInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlSearch = searchParams.get("search");
      if (urlSearch) return urlSearch;
      return sessionStorage.getItem(STORAGE_KEY_SEARCH) || "";
    }
    return "";
  });

  // 검색 키워드 - 실제 필터링에 사용할 값 (디바운싱 후)
  const [searchKeyword, setSearchKeyword] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlSearch = searchParams.get("search");
      if (urlSearch) return urlSearch;
      return sessionStorage.getItem(STORAGE_KEY_SEARCH) || "";
    }
    return "";
  });

  // region_id가 변경될 때마다 sessionStorage와 URL에 저장
  useEffect(() => {
    if (selectedRegionId === null) {
      sessionStorage.removeItem(STORAGE_KEY_REGION);
    } else {
      sessionStorage.setItem(STORAGE_KEY_REGION, selectedRegionId.toString());
    }

    // URL 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (selectedRegionId === null) {
      params.delete("region");
    } else {
      params.set("region", selectedRegionId.toString());
    }

    // 지역 필터가 변경되면 페이지를 1로 리셋
    params.delete("page");

    const newUrl = `${pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedRegionId, pathname, router, searchParams]);

  // 검색 키워드가 변경될 때마다 sessionStorage와 URL에 저장
  useEffect(() => {
    if (searchKeyword.trim() === "") {
      sessionStorage.removeItem(STORAGE_KEY_SEARCH);
    } else {
      sessionStorage.setItem(STORAGE_KEY_SEARCH, searchKeyword);
    }

    // URL 업데이트 (현재 URL의 다른 파라미터 유지)
    const currentParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();

    // 검색 키워드가 변경되면 페이지를 1로 리셋
    // page 파라미터는 추가하지 않음 (기본값 1)

    // search 설정
    if (searchKeyword.trim() !== "") {
      params.set("search", searchKeyword);
    }

    // sort 유지
    const sort = currentParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }

    // favorite 유지
    const favorite = currentParams.get("favorite");
    if (favorite) {
      params.set("favorite", favorite);
    }

    const newUrl = `${pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchKeyword, pathname, router]);

  // URL 파라미터 변경 감지 (Navbar에서 초기화된 경우)
  useEffect(() => {
    const urlSearch = searchParams.get("search");

    // URL에 search가 없으면 상태도 초기화
    if (!urlSearch && searchInput) {
      setSearchInput("");
      setSearchKeyword("");
    }
    // URL에 search가 있고 현재 상태와 다르면 동기화
    else if (urlSearch && urlSearch !== searchKeyword) {
      setSearchInput(urlSearch);
      setSearchKeyword(urlSearch);
    }
  }, [searchParams]);

  // 디바운싱: 입력이 끝난 후 500ms 후에 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSortChange = (sortValue: string) => {
    // sessionStorage에 저장
    sessionStorage.setItem(STORAGE_KEY_SORT, sortValue);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    // 정렬 방식이 변경되면 페이지를 1로 리셋
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleFavoriteToggle = () => {
    const newValue = !showFavoritesOnly;

    // sessionStorage에 저장
    if (newValue) {
      sessionStorage.setItem(STORAGE_KEY_FAVORITE, "true");
    } else {
      sessionStorage.removeItem(STORAGE_KEY_FAVORITE);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set("favorite", "true");
    } else {
      params.delete("favorite");
    }
    // 찜 필터가 변경되면 페이지를 1로 리셋
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegionId(regionId);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchInput(keyword);
  };

  return {
    currentSort,
    showFavoritesOnly,
    selectedRegionId,
    searchInput,
    searchKeyword,
    handleRegionChange,
    handleSortChange,
    handleFavoriteToggle,
    handleSearchChange,
  };
};

// 여행지 필터 관리 훅
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY_REGION = "place_filter_region_id";
const STORAGE_KEY_SEARCH = "place_filter_search_keyword";

export const usePlaceFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "popularity";
  const showFavoritesOnly = searchParams.get("favorite") === "true";

  // region_id 기반으로 변경 (null = 전체)
  // 초기값을 sessionStorage에서 가져오기
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY_REGION);
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  // 검색 키워드도 sessionStorage에서 복원
  const [searchKeyword, setSearchKeyword] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(STORAGE_KEY_SEARCH) || "";
    }
    return "";
  });

  // region_id가 변경될 때마다 sessionStorage에 저장
  useEffect(() => {
    if (selectedRegionId === null) {
      sessionStorage.removeItem(STORAGE_KEY_REGION);
    } else {
      sessionStorage.setItem(STORAGE_KEY_REGION, selectedRegionId.toString());
    }
  }, [selectedRegionId]);

  // 검색 키워드가 변경될 때마다 sessionStorage에 저장
  useEffect(() => {
    if (searchKeyword.trim() === "") {
      sessionStorage.removeItem(STORAGE_KEY_SEARCH);
    } else {
      sessionStorage.setItem(STORAGE_KEY_SEARCH, searchKeyword);
    }
  }, [searchKeyword]);

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    router.push(`?${params.toString()}`);
  };

  const handleFavoriteToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showFavoritesOnly) {
      params.delete("favorite");
    } else {
      params.set("favorite", "true");
    }
    router.push(`?${params.toString()}`);
  };

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegionId(regionId);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  return {
    currentSort,
    showFavoritesOnly,
    selectedRegionId,
    searchKeyword,
    handleRegionChange,
    handleSortChange,
    handleFavoriteToggle,
    handleSearchChange,
  };
};

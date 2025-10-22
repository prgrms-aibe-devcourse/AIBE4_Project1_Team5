// 여행지 필터 관리 훅
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const usePlaceFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "popularity_desc";
  const showFavoritesOnly = searchParams.get("favorite") === "true";

  // region_id 기반으로 변경 (null = 전체)
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

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

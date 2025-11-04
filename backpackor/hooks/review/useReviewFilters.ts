// 리뷰 필터 관리 훅
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STORAGE_KEY_REGION = "review_filter_region_id";
const STORAGE_KEY_SORT = "review_filter_sort";
const STORAGE_KEY_MY_REVIEWS = "review_filter_my_reviews";

export const useReviewFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 초기값: URL > sessionStorage 순으로 확인
  const currentSort = searchParams.get("sort") ||
    (typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY_SORT) : null) ||
    "latest";

  const showMyReviewsOnly = searchParams.get("my_review") === "true" ||
    (typeof window !== "undefined" && !searchParams.get("my_review")
      ? sessionStorage.getItem(STORAGE_KEY_MY_REVIEWS) === "true"
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

    const newUrl = `${pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedRegionId, pathname, router, searchParams]);

  const handleSortChange = (sortValue: string) => {
    // sessionStorage에 저장
    sessionStorage.setItem(STORAGE_KEY_SORT, sortValue);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortValue);
    router.push(`?${params.toString()}`);
  };

  const handleMyReviewsToggle = () => {
    const newValue = !showMyReviewsOnly;

    // sessionStorage에 저장
    if (newValue) {
      sessionStorage.setItem(STORAGE_KEY_MY_REVIEWS, "true");
    } else {
      sessionStorage.removeItem(STORAGE_KEY_MY_REVIEWS);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set("my_review", "true");
    } else {
      params.delete("my_review");
    }
    router.push(`?${params.toString()}`);
  };

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegionId(regionId);
  };

  return {
    currentSort,
    showMyReviewsOnly,
    selectedRegionId,
    handleRegionChange,
    handleSortChange,
    handleMyReviewsToggle,
  };
};

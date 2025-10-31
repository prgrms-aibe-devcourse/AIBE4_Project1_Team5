// 여행지 목록 관리 훅
"use client";

import { useState, useEffect } from "react";
import {
  getAllPlaces,
  getFavoritePlaces,
  searchPlaces,
  getTotalPlacesCount,
  type PlaceSearchFilters
} from "@/apis/placeApi";
import { useAuth } from "@/hooks/auth/useAuth";
import type { Place } from "@/types/place";

interface UsePlacesOptions {
  sortBy: string;
  showFavoritesOnly: boolean;
  filters?: PlaceSearchFilters;
  page: number;
  limit?: number;
}

export const usePlaces = ({
  sortBy,
  showFavoritesOnly,
  filters,
  page,
  limit = 50
}: UsePlacesOptions) => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 데이터 로드
  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);

      try {
        if (showFavoritesOnly) {
          if (!user) {
            setPlaces([]);
            setTotalCount(0);
            setTotalPages(0);
            setIsLoading(false);
            return;
          }

          const favoritePlaces = await getFavoritePlaces(user.id, sortBy);
          setPlaces(favoritePlaces);
          setTotalCount(favoritePlaces.length);
          setTotalPages(1);
        } else {
          // 검색 필터가 있으면 searchPlaces 사용
          const hasFilters = filters && (
            filters.searchQuery ||
            filters.regionId ||
            filters.category
          );

          let fetchedPlaces: Place[];
          let count: number;

          if (hasFilters) {
            fetchedPlaces = await searchPlaces(filters!, sortBy, page, limit);
            count = await getTotalPlacesCount(filters);
          } else {
            fetchedPlaces = await getAllPlaces(sortBy, page, limit);
            count = await getTotalPlacesCount();
          }

          setPlaces(fetchedPlaces);
          setTotalCount(count);
          setTotalPages(Math.ceil(count / limit));
        }
      } catch (err) {
        console.error("여행지 조회 오류:", err);
        setPlaces([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [sortBy, showFavoritesOnly, user, filters, page, limit]);

  return {
    places,
    isLoading,
    totalCount,
    totalPages
  };
};

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
import { PlaceCache } from "@/lib/placeCache";

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
  limit = 15
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

          const favoritePlaces = await getFavoritePlaces(user.id, sortBy, filters);
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

          // 먼저 총 개수를 조회하여 페이지 수 계산
          const count = hasFilters
            ? await getTotalPlacesCount(filters)
            : await getTotalPlacesCount();

          setTotalCount(count);
          setTotalPages(Math.ceil(count / limit));

          // 데이터가 없으면 빈 배열 반환
          if (count === 0) {
            setPlaces([]);
            setIsLoading(false);
            return;
          }

          // 필터링된 경우 캐싱 없이 직접 페이지 데이터 조회
          if (hasFilters) {
            const fetchedPlaces = await searchPlaces(filters!, sortBy, page, limit);
            setPlaces(fetchedPlaces);
            setIsLoading(false);
            return;
          }

          // 캐시에서 데이터 조회
          const cachedData = PlaceCache.getPageData(sortBy, filters, page, limit);

          if (cachedData && cachedData.length > 0) {
            // 캐시에 데이터가 있으면 사용
            setPlaces(cachedData);
            setIsLoading(false);

            // 100페이지 경계(청크 경계) 근처에서 다음 청크 프리로드
            const chunkSize = PlaceCache.getChunkSize(); // 1500
            const currentChunkIndex = Math.floor(((page - 1) * limit) / chunkSize);
            const pagesPerChunk = Math.floor(chunkSize / limit); // 100 페이지
            const pageInChunk = page - (currentChunkIndex * pagesPerChunk);

            // 95페이지 이상에 도달하면 다음 청크(101-200페이지용) 프리로드
            if (pageInChunk >= 95) {
              const nextChunkIndex = currentChunkIndex + 1;
              const nextChunkExists = PlaceCache.getChunk(sortBy, filters, nextChunkIndex);

              if (!nextChunkExists) {
                // 백그라운드에서 다음 청크 로드
                console.log(`페이지 ${page}: 다음 청크(${nextChunkIndex}) 프리로드 시작`);
                setTimeout(async () => {
                  // API 호출: nextChunkIndex가 1이면 page=2, limit=1500
                  const apiPage = nextChunkIndex + 1;
                  const apiLimit = chunkSize;

                  let nextChunkData: Place[];

                  if (hasFilters) {
                    nextChunkData = await searchPlaces(filters!, sortBy, apiPage, apiLimit);
                  } else {
                    nextChunkData = await getAllPlaces(sortBy, apiPage, apiLimit);
                  }

                  if (nextChunkData.length > 0) {
                    PlaceCache.setChunk(sortBy, filters, nextChunkIndex, nextChunkData);
                    console.log(`청크 ${nextChunkIndex} 프리로드 완료 (${nextChunkData.length}개)`);
                  }
                }, 100);
              }
            }

            return;
          }

          // 캐시 미스: 청크 단위로 데이터 로드
          const chunkSize = PlaceCache.getChunkSize(); // 1500
          const chunkIndex = Math.floor(((page - 1) * limit) / chunkSize);

          // API 호출: chunkIndex가 0이면 page=1, chunkIndex가 1이면 page=2
          // limit은 항상 1500 (한 청크 전체)
          const apiPage = chunkIndex + 1;
          const apiLimit = chunkSize;

          console.log(`페이지 ${page}: 청크 ${chunkIndex} 로드 (API: page=${apiPage}, limit=${apiLimit})`);

          let fetchedPlaces: Place[];

          if (hasFilters) {
            // 1500개 청크 단위로 로드
            fetchedPlaces = await searchPlaces(filters!, sortBy, apiPage, apiLimit);
          } else {
            // 1500개 청크 단위로 로드
            fetchedPlaces = await getAllPlaces(sortBy, apiPage, apiLimit);
          }

          console.log(`청크 ${chunkIndex} 로드 완료: ${fetchedPlaces.length}개`);

          // 캐시에 청크 저장
          if (fetchedPlaces.length > 0) {
            PlaceCache.setChunk(sortBy, filters, chunkIndex, fetchedPlaces);
          }

          // 현재 페이지에 해당하는 데이터 추출
          const offset = (page - 1) * limit - chunkIndex * chunkSize;
          const pageData = fetchedPlaces.slice(offset, offset + limit);

          console.log(`페이지 ${page} 데이터: offset=${offset}, 데이터 개수=${pageData.length}`);

          setPlaces(pageData);
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

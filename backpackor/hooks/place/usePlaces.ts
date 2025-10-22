// 여행지 목록 관리 훅
"use client";

import { useState, useEffect } from "react";
import { getAllPlaces, getFavoritePlaces } from "@/apis/placeApi";
import { useAuth } from "@/hooks/auth/useAuth";
import type { Place } from "@/types/place";

export const usePlaces = (sortBy: string, showFavoritesOnly: boolean) => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);

      try {
        if (showFavoritesOnly) {
          if (!user) {
            setPlaces([]);
            setIsLoading(false);
            return;
          }

          const favoritePlaces = await getFavoritePlaces(user.id, sortBy);
          setPlaces(favoritePlaces);
        } else {
          const allPlaces = await getAllPlaces(sortBy);
          setPlaces(allPlaces);
        }
      } catch (err) {
        console.error("여행지 조회 오류:", err);
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [sortBy, showFavoritesOnly, user]);

  return { places, isLoading };
};

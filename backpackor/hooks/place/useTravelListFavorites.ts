// 여행지 찜 목록 관리 훅 (TravelListContainer용)
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabaseClient";

export const useTravelListFavorites = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      const supabase = createBrowserClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_favorite_place")
          .select("place_id")
          .eq("user_id", user.id);

        if (error) throw error;

        if (data) {
          setFavoritePlaceIds(new Set(data.map((item) => item.place_id)));
        }
      } catch (error) {
        console.error("🚨 찜 목록 조회 중 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return { isLoading, favoritePlaceIds };
};

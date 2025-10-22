// 사용자 활동 개수를 가져오는 훅
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ActivityCounts {
  tripCount: number;
  favoriteCount: number;
  reviewCount: number;
}

export const useActivityCounts = (userId: string | undefined) => {
  const [counts, setCounts] = useState<ActivityCounts>({
    tripCount: 0,
    favoriteCount: 0,
    reviewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // 내 일정 개수
        const { count: tripCount } = await supabase
          .from("trip_plan")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // 찜한 장소 개수
        const { count: favoriteCount } = await supabase
          .from("user_favorite_place")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        // 내 리뷰 개수
        const { count: reviewCount } = await supabase
          .from("review")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        setCounts({
          tripCount: tripCount ?? 0,
          favoriteCount: favoriteCount ?? 0,
          reviewCount: reviewCount ?? 0,
        });
      } catch (error) {
        console.error("활동 개수 조회 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [userId]);

  return { counts, isLoading };
};

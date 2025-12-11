"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { PlaceCache } from "@/lib/placeCache";
import { HomeCache } from "@/lib/homeCache";

interface FavoriteButtonProps {
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
  placeId: string;
}

export default function FavoriteButton({
  initialIsFavorite,
  initialFavoriteCount,
  placeId,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // 컴포넌트 로드 시, 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // 로그인된 사용자의 찜 목록을 조회해서 isFavorite 초기 상태를 설정
      if (user) {
        const { data } = await supabase
          .from("user_favorite_place")
          .select("place_id")
          .eq("user_id", user.id)
          .eq("place_id", placeId)
          .maybeSingle();

        setIsFavorite(!!data);
      }
    };
    fetchUser();
  }, [placeId]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const confirmLogin = window.confirm(
        "로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        //placeId만 저장
        const placeIdFromPath = window.location.pathname.split("/").pop();
        sessionStorage.setItem("redirectAfterLogin", placeIdFromPath || "");
        router.push("/login");
      }
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const supabase = createBrowserClient();

      if (isFavorite) {
        // 찜 취소: user_favorite_place에서 삭제
        const { error: deleteError } = await supabase
          .from("user_favorite_place")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", placeId);

        if (deleteError) throw deleteError;

        // place 테이블의 favorite_count 감소
        const { error: updateError } = await supabase.rpc(
          "update_favorite_count",
          {
            place_id_input: placeId,
            increment_amount: -1,
          }
        );

        if (updateError) throw updateError;

        setIsFavorite(false);
        setFavoriteCount(favoriteCount - 1);
      } else {
        // 찜 추가: user_favorite_place에 추가
        const { error: insertError } = await supabase
          .from("user_favorite_place")
          .insert({
            user_id: user.id,
            place_id: placeId,
          });

        if (insertError) throw insertError;

        // place 테이블의 favorite_count 증가
        const { error: updateError } = await supabase.rpc(
          "update_favorite_count",
          {
            place_id_input: placeId,
            increment_amount: 1,
          }
        );

        if (updateError) throw updateError;

        setIsFavorite(true);
        setFavoriteCount(favoriteCount + 1);

        const { data: updatedPlace } = await supabase
          .from("place")
          .select("favorite_count")
          .eq("place_id", placeId)
          .single();

        console.log(`[찜 추가] ${placeId}: favorite_count = ${updatedPlace?.favorite_count}`);
      }

      // 찜 상태가 변경되면 모든 여행지 캐시를 무효화
      console.log(`[찜 ${isFavorite ? '취소' : '추가'}] ${placeId} - 캐시 무효화 시작`);
      PlaceCache.clearAllCache();
      HomeCache.clear(); // 메인페이지 캐시도 무효화

      // TOP 3 Materialized View 갱신
      console.log("[찜] TOP 3 갱신 시작");
      await supabase.rpc('refresh_top_places');

      // 페이지 리프레시하여 새로운 정렬 데이터 가져오기
      console.log("[찜] router.refresh() 호출");
      router.refresh();

      // DB 동기화 대기
      setTimeout(() => {
        console.log("[찜] 2차 router.refresh() 호출");
        router.refresh();
      }, 100);

    } catch (error) {
      console.error("찜 업데이트 실패:", error);
      alert("찜 상태를 업데이트하는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`w-full h-full flex items-center justify-center transition-all ${
        isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
      }`}
      aria-label="찜하기"
      disabled={isLoading}
    >
      <Heart
        size={24}
        className={`transition-all ${
          isFavorite
            ? "text-red-500 fill-red-500"
            : "text-gray-700 fill-none stroke-[2] hover:text-red-400"
        }`}
      />
    </button>
  );
}

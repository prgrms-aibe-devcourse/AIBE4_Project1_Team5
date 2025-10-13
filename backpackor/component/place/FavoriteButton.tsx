// component/place/FavoriteButton.tsx

"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

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

  const supabase = createBrowserClient();
  const router = useRouter();

  // 컴포넌트 로드 시, 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // TODO: 로그인된 사용자의 찜 목록을 조회해서 isFavorite 초기 상태를 설정
    };
    fetchUser();
  }, [supabase]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // [핵심 기능!] 로그인하지 않았다면 알림 후 로그인 페이지로 이동
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      router.push("/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const incrementAmount = isFavorite ? -1 : 1;
    setIsFavorite(!isFavorite);
    setFavoriteCount(favoriteCount + incrementAmount);

    const { error } = await supabase.rpc("update_favorite_count", {
      place_id_input: placeId,
      increment_amount: incrementAmount,
    });

    if (error) {
      console.error("찜 업데이트 실패:", error);
      setIsFavorite(isFavorite);
      setFavoriteCount(favoriteCount);
      alert("찜 상태를 업데이트하는 데 실패했습니다.");
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`absolute top-3 right-3 z-10 p-2 bg-white/70 rounded-full backdrop-blur-sm hover:bg-white/90 transition-colors ${
        isLoading ? "cursor-not-allowed" : ""
      }`}
      aria-label="찜하기"
      disabled={isLoading}
    >
      <div className="flex flex-col items-center">
        <Heart
          size={20}
          className={`transition-all ${
            isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
          }`}
        />
        <span className="text-xs font-semibold text-gray-700 mt-1">
          {favoriteCount}
        </span>
      </div>
    </button>
  );
}

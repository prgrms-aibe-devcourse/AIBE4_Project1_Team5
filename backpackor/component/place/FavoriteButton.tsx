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
  isLarge?: boolean; // [추가] 크게 표시할지 여부를 결정하는 prop
}

export default function FavoriteButton({
  initialIsFavorite,
  initialFavoriteCount,
  placeId,
  isLarge = false, // [수정] 기본값은 false (작은 버튼)
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // [수정] isLarge prop에 따라 스타일을 다르게 적용
  const buttonClasses = `
    z-10 bg-white/70 rounded-full backdrop-blur-sm transition-colors
    ${isLarge ? 'p-4' : 'p-2'} // 상세 페이지에서는 더 큰 패딩
    ${isLarge ? 'h-16 w-16 flex items-center justify-center' : ''} // 상세 페이지에서 고정 크기 및 중앙 정렬 (내부)
    ${isLoading ? "cursor-not-allowed" : "hover:bg-white/90"}
  `;

  const heartSize = isLarge ? 36 : 20; // [수정] isLarge에 따라 하트 아이콘 크기 조절
  const countTextSize = isLarge ? 'text-base' : 'text-xs'; // [추가] 찜 개수 텍스트 크기 조절

  return (
    <button
      onClick={handleFavoriteClick}
      className={buttonClasses}
      aria-label="찜하기"
      disabled={isLoading}
    >
      <div className="flex flex-col items-center">
        <Heart
          size={heartSize}
          className={`transition-all ${
            isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
          }`}
        />
        <span className={`${countTextSize} font-semibold text-gray-700 mt-1`}>
          {favoriteCount}
        </span>
      </div>
    </button>
  );
}
// 여행지 그리드 컴포넌트
"use client";

import { useState } from "react";
import { PlaceCard } from "../card/PlaceCard";
import type { Place } from "@/types/place";

interface PlaceGridProps {
  places: Place[];
  showFavoritesOnly: boolean;
}

export const PlaceGrid = ({ places, showFavoritesOnly }: PlaceGridProps) => {
  const [visibleCount, setVisibleCount] = useState(18);

  // 빈 목록 처리
  if (places.length === 0) {
    if (showFavoritesOnly) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">찜한 여행지가 없습니다.</p>
          <p className="text-gray-400 text-sm">
            마음에 드는 여행지를 찜해보세요! ❤️
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">여행지가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.slice(0, visibleCount).map((place) => (
          <PlaceCard key={place.place_id} place={place} />
        ))}
      </div>

      {visibleCount < places.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            더보기
          </button>
        </div>
      )}
    </>
  );
};

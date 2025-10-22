// 여행지 리스트 아이템 컴포넌트 (TravelListContainer용)
"use client";

import Image from "next/image";
import type { Place } from "@/types/place";

interface TravelListItemProps {
  place: Place;
  onPlaceClick: (placeId: string) => void;
  onAddPlace: (place: Place) => void;
}

export const TravelListItem = ({
  place,
  onPlaceClick,
  onAddPlace,
}: TravelListItemProps) => {
  const region = (place as any).region;

  return (
    <div
      onClick={() => onPlaceClick(place.place_id)}
      className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {place.place_image && (
          <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100">
            <Image
              src={place.place_image}
              alt={place.place_name}
              fill
              sizes="56px"
              className="rounded-lg object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {place.place_name}
          </div>
          <div className="text-xs text-gray-500 mt-1">{region}</div>
          <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
            <span>⭐ {place.average_rating != null && place.average_rating > 0 ? place.average_rating.toFixed(1) : "0.0"}</span>
            <span>❤️ {place.favorite_count ?? 0}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddPlace(place);
          }}
          className="p-2 rounded-full hover:bg-blue-100 transition-colors"
          title="일정에 추가"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

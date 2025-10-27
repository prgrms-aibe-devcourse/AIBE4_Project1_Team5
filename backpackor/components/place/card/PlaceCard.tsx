// 여행지 카드 컴포넌트
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Place } from "@/types/place";

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard = ({ place }: PlaceCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    place.place_image ?? "/default-image.png"
  );

  const region = place.place_address?.split(" ")[0] || "지역 정보 없음";
  const displayRating =
    place.average_rating !== null && place.average_rating !== undefined
      ? place.average_rating.toFixed(1)
      : "0.0";
  const displayFavoriteCount = place.favorite_count ?? 0;

  return (
    <Link
      href={`/place/${place.place_id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      <div className="relative w-full aspect-video bg-gray-100">
        <img
          src={imgSrc}
          alt={place.place_name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgSrc("/default-image.png")}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold mb-1">{place.place_name}</h3>
        <p className="text-sm text-gray-600 mb-2">{region}</p>
        <div className="mt-auto flex justify-between items-center">
          <p className="flex items-center text-sm font-semibold">
            <svg
              className="w-5 h-5 text-yellow-400 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.401 4.753 .392c.83.069 1.171 1.107 .536 1.651l-3.62 3.102 1.07 4.632c.181 .79-.702 1.4-1.437 1.016L12 16.205l-4.118 2.593c-.735.384-1.618-.226-1.437-1.016l1.07-4.632L3.29 8.928c-.635-.544-.294-1.582.536-1.651l4.753-.392l1.83-4.401Z" />
            </svg>
            {displayRating}
          </p>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-red-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>{displayFavoriteCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

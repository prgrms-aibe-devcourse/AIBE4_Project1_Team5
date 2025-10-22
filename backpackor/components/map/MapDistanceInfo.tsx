// 지도 거리 정보 컴포넌트
"use client";

import { formatDistance } from "@/utils/mapHelpers";

interface MapDistanceInfoProps {
  totalDistance: number;
}

export const MapDistanceInfo = ({ totalDistance }: MapDistanceInfoProps) => {
  if (totalDistance <= 0) {
    return null;
  }

  return (
    <div className="mb-3 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
      총 이동거리: {formatDistance(totalDistance)} km
    </div>
  );
};

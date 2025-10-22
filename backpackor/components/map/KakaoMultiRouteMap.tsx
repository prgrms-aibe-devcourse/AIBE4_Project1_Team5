// 카카오 다중 경로 지도 컴포넌트
"use client";

import { useMemo, useState } from "react";
import { useKakaoLoader } from "@/hooks/map/useKakaoLoader";
import { useKakaoMapRenderer } from "@/hooks/map/useKakaoMapRenderer";
import { useMapFocus } from "@/hooks/map/useMapFocus";
import { MapLegend } from "./MapLegend";
import { MapDistanceInfo } from "./MapDistanceInfo";
import { MapLoadingState } from "./MapLoadingState";
import { calculateTotalDistance, getSortedDayKeys, getColorForDay } from "@/utils/mapHelpers";
import type { KakaoMapProps } from "@/types/map";

export default function KakaoMultiRouteMap({
  plan = {},
  kakaoApiKey,
  focusDay,
  onFocusComplete,
  onShowAll,
}: KakaoMapProps) {
  // Kakao SDK 로드
  const { loaded, error } = useKakaoLoader(kakaoApiKey);

  // Day 키 정렬
  const dayKeys = useMemo(() => getSortedDayKeys(plan), [plan]);

  // 지도 렌더링
  const { dayDistances, mapRef, dayBoundsRef, allBoundsRef } = useKakaoMapRenderer({
    loaded,
    plan,
    dayKeys,
  });

  // 로컬 상태로 focusDay 관리
  const [localFocusDay, setLocalFocusDay] = useState<number | null>(null);

  // Day 포커스 처리 (외부 focusDay 또는 로컬 focusDay 사용)
  useMapFocus({
    focusDay: focusDay ?? localFocusDay,
    mapRef,
    dayBoundsRef,
    onFocusComplete: () => {
      setLocalFocusDay(null);
      onFocusComplete?.();
    },
  });

  // 총 거리 계산
  const totalDistance = useMemo(
    () => calculateTotalDistance(dayDistances),
    [dayDistances]
  );

  // Day 버튼 클릭 핸들러
  const handleDayClick = (day: number) => {
    setLocalFocusDay(day);
  };

  // 한눈에 보기 버튼 클릭 핸들러 (외부에서 전달된 경우 사용)
  const handleShowAllClick = () => {
    if (mapRef.current && allBoundsRef.current && !allBoundsRef.current.isEmpty()) {
      mapRef.current.setBounds(allBoundsRef.current);
      setLocalFocusDay(null);
    }
    if (onShowAll) {
      onShowAll();
    }
  };

  return (
    <div className="w-full">
      {/* 헤더 & 범례 */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="font-bold text-lg text-gray-900">여행 경로 미리보기</h3>
        <MapLegend dayKeys={dayKeys} />
      </div>

      {/* 총 이동거리 & 한눈에 보기 */}
      <div className="flex justify-between items-center mb-3">
        <div>
          {totalDistance > 0 && (
            <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
              총 이동거리: {(totalDistance / 1000).toFixed(2)} km
            </div>
          )}
        </div>
        {onShowAll && (
          <button
            onClick={handleShowAllClick}
            className="px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 shadow-md transition-all"
          >
            한눈에 보기
          </button>
        )}
      </div>

      {/* 지도 컨테이너 */}
      <div
        id="kakao-multi-route-map"
        className="w-full h-[520px] border border-gray-200 rounded-xl shadow-md"
      />

      {/* 로딩/에러 상태 */}
      <MapLoadingState loaded={loaded} error={error} />
    </div>
  );
}

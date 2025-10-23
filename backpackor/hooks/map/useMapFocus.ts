// 지도 포커스 처리 훅
"use client";

import { useEffect } from "react";

interface UseMapFocusProps {
  focusDay: number | null | undefined;
  mapRef: React.MutableRefObject<any>;
  dayBoundsRef: React.MutableRefObject<Record<number, any>>;
  onFocusComplete?: () => void;
}

/** 특정 Day에 지도 포커스를 맞추는 훅 */
export const useMapFocus = ({
  focusDay,
  mapRef,
  dayBoundsRef,
  onFocusComplete,
}: UseMapFocusProps) => {
  useEffect(() => {
    if (!focusDay || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const bounds = dayBoundsRef.current[focusDay];

    // Vercel 환경에서 bounds가 준비될 때까지 대기
    if (!bounds || bounds.isEmpty()) {
      console.warn(`[useMapFocus] Day ${focusDay}의 bounds가 아직 준비되지 않았습니다.`);
      return;
    }

    // requestAnimationFrame을 사용하여 지도가 완전히 렌더링된 후 bounds 적용
    requestAnimationFrame(() => {
      try {
        map.setBounds(bounds);
        console.log(`[useMapFocus] Day ${focusDay} 포커스 완료`);
      } catch (error) {
        console.error(`[useMapFocus] setBounds 실패:`, error);
      }
    });

    // 포커스 완료 콜백은 자동 호출하지 않음 (사용자가 명시적으로 호출해야 함)
    // if (onFocusComplete) {
    //   setTimeout(() => onFocusComplete(), 500);
    // }
  }, [focusDay, mapRef, dayBoundsRef, onFocusComplete]);
};

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
    if (!focusDay || !mapRef.current || !dayBoundsRef.current[focusDay]) {
      return;
    }

    const map = mapRef.current;
    const bounds = dayBoundsRef.current[focusDay];

    if (bounds && !bounds.isEmpty()) {
      map.setBounds(bounds);

      // 약간 줌 아웃 (여유 공간 확보)
      setTimeout(() => {
        const currentLevel = map.getLevel();
        map.setLevel(currentLevel + 1);
      }, 300);
    }

    // 포커스 완료 콜백은 자동 호출하지 않음 (사용자가 명시적으로 호출해야 함)
    // if (onFocusComplete) {
    //   setTimeout(() => onFocusComplete(), 500);
    // }
  }, [focusDay, mapRef, dayBoundsRef, onFocusComplete]);
};

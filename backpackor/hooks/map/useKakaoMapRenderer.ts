// Kakao Map 렌더링 훅
"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_MAP_CONFIG, MARKER_STYLE } from "@/constants/map";
import {
  calculateDistance,
  filterValidCoords,
  getColorForDay,
} from "@/utils/mapHelpers";
import type { DayDistances, DayPlan } from "@/types/map";

interface UseKakaoMapRendererProps {
  loaded: boolean;
  plan: DayPlan;
  dayKeys: number[];
}

export const useKakaoMapRenderer = ({
  loaded,
  plan,
  dayKeys,
}: UseKakaoMapRendererProps) => {
  const [dayDistances, setDayDistances] = useState<DayDistances>({});
  const mapRef = useRef<any>(null);
  const dayBoundsRef = useRef<Record<number, any>>({});
  const allBoundsRef = useRef<any>(null);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    if (!window.kakao?.maps?.LatLngBounds) {
      return;
    }

    const kakao = window.kakao;
    const container = document.getElementById("kakao-multi-route-map");

    if (!container) {
      return;
    }

    // 지도 생성
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(
        DEFAULT_MAP_CONFIG.center.lat,
        DEFAULT_MAP_CONFIG.center.lng
      ),
      level: DEFAULT_MAP_CONFIG.level,
    });

    mapRef.current = map;

    const allBounds = new kakao.maps.LatLngBounds();
    const distances: DayDistances = {};
    const bounds: Record<number, any> = {};

    // Day별 경로 처리
    dayKeys.forEach((day, dayIndex) => {
      const places = plan[day] || [];
      const validCoords = filterValidCoords(places);

      if (validCoords.length === 0) {
        return;
      }

      const color = getColorForDay(dayIndex);
      const dayBounds = new kakao.maps.LatLngBounds();
      let totalDistance = 0;

      // 마커 및 경로 생성
      validCoords.forEach((place, index) => {
        const latlng = new kakao.maps.LatLng(place.latitude, place.longitude);

        // 마커 생성
        new kakao.maps.Marker({
          position: latlng,
          map,
        });

        // 번호 오버레이
        const label = createNumberLabel(place.order, color);
        new kakao.maps.CustomOverlay({
          content: label,
          position: latlng,
          yAnchor: 1.5,
          map,
        });

        // 거리 계산
        if (index > 0) {
          const prev = validCoords[index - 1];
          totalDistance += calculateDistance(
            prev.latitude,
            prev.longitude,
            place.latitude,
            place.longitude
          );
        }

        dayBounds.extend(latlng);
        allBounds.extend(latlng);
      });

      // 거리 저장
      distances[day] = totalDistance;
      bounds[day] = dayBounds;

      // Polyline (경로선) 생성
      const path = validCoords.map(
        (p) => new kakao.maps.LatLng(p.latitude, p.longitude)
      );

      if (path.length > 1) {
        new kakao.maps.Polyline({
          map,
          path,
          strokeWeight: 5,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
      }

      // Day 라벨 표시
      if (
        dayBounds &&
        typeof dayBounds.getCenter === "function" &&
        !dayBounds.isEmpty()
      ) {
        const center = dayBounds.getCenter();
        const dayLabel = createDayLabel(day, color);
        new kakao.maps.CustomOverlay({
          content: dayLabel,
          position: center,
          yAnchor: -0.5,
          map,
        });
      }
    });

    setDayDistances(distances);
    dayBoundsRef.current = bounds;
    allBoundsRef.current = allBounds;

    if (!allBounds.isEmpty()) {
      map.setBounds(allBounds);
    }
  }, [loaded, plan, dayKeys]);

  return {
    dayDistances,
    mapRef,
    dayBoundsRef,
    allBoundsRef,
  };
};

/** 번호 라벨 생성 */
const createNumberLabel = (order: number, color: string): HTMLDivElement => {
  const label = document.createElement("div");
  label.style.cssText = `
    display:flex;
    align-items:center;
    justify-content:center;
    background:${color};
    color:#fff;
    border-radius:50%;
    width:${MARKER_STYLE.width}px;
    height:${MARKER_STYLE.height}px;
    font-size:${MARKER_STYLE.fontSize}px;
    font-weight:700;
    border:${MARKER_STYLE.borderWidth}px solid #fff;
    box-shadow:0 2px 4px rgba(0,0,0,0.3);
  `;
  label.innerText = String(order);
  return label;
};

/** Day 라벨 생성 */
const createDayLabel = (day: number, color: string): HTMLDivElement => {
  const label = document.createElement("div");
  label.style.cssText = `
    padding:6px 12px;
    background:${color};
    color:#fff;
    font-weight:700;
    border-radius:9999px;
    border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.15);
  `;
  label.innerText = `Day ${day}`;
  return label;
};

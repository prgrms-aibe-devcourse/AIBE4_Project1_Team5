"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type DayPlace = {
  order: number;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Plan = Record<number, DayPlace[]>;

interface KakaoMultiRouteMapProps {
  plan?: Plan;
  kakaoApiKey?: string;
  focusDay?: number | null;
  onFocusComplete?: () => void;
}

// 색상 팔레트
const ROUTE_COLORS = [
  "#2563EB", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
  "#22C55E", // green
  "#06B6D4", // cyan
  "#E11D48", // rose
];

const getColorForDay = (dayIndex: number) =>
  ROUTE_COLORS[dayIndex % ROUTE_COLORS.length];

// ✅ Kakao Maps SDK 로더
function useKakaoLoader(apiKey?: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 이미 로드된 경우
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    if (!apiKey) {
      setError("Kakao API Key가 제공되지 않았습니다.");
      return;
    }

    const scriptId = "kakao-maps-sdk";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        setTimeout(() => setLoaded(true), 100);
      });
    };
    script.onerror = () => {
      setError("Kakao Maps SDK 로드 실패");
    };
    document.head.appendChild(script);
  }, [apiKey]);

  return { loaded, error };
}

// 거리 계산 함수
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function KakaoMultiRouteMap({
  plan = {},
  kakaoApiKey,
  focusDay,
  onFocusComplete,
}: KakaoMultiRouteMapProps) {
  const { loaded, error } = useKakaoLoader(kakaoApiKey);
  const [dayDistances, setDayDistances] = useState<Record<number, number>>({});
  const mapRef = useRef<any>(null);
  const dayBoundsRef = useRef<Record<number, any>>({});

  // ✅ 안전한 day key 정렬
  const dayKeys = useMemo(() => {
    if (!plan || typeof plan !== "object") return [];
    return Object.keys(plan)
      .map((n) => parseInt(n, 10))
      .sort((a, b) => a - b);
  }, [plan]);

  // 지도 초기화
  useEffect(() => {
    if (!loaded) return;
    if (typeof window === "undefined") return;
    if (!window.kakao?.maps?.LatLngBounds) {
      console.warn("❌ Kakao Maps SDK not fully ready yet");
      return;
    }

    const kakao = window.kakao;
    const container = document.getElementById("kakao-multi-route-map");
    if (!container) return;

    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });

    mapRef.current = map;

    const allBounds = new kakao.maps.LatLngBounds();
    const distances: Record<number, number> = {};
    const bounds: Record<number, any> = {};

    // Day별 경로 처리
    dayKeys.forEach((day, dayIndex) => {
      const places = plan[day] || [];
      const validCoords = places.filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          !isNaN(p.latitude) &&
          !isNaN(p.longitude)
      );

      if (validCoords.length === 0) return;

      const color = getColorForDay(dayIndex);
      const dayBounds = new kakao.maps.LatLngBounds();
      let totalDistance = 0;

      validCoords.forEach((place, index) => {
        const latlng = new kakao.maps.LatLng(place.latitude, place.longitude);

        // 마커 생성
        new kakao.maps.Marker({
          position: latlng,
          map,
        });

        // 번호 오버레이
        const label = document.createElement("div");
        label.style.cssText = `
          display:flex;
          align-items:center;
          justify-content:center;
          background:${color};
          color:#fff;
          border-radius:50%;
          width:26px;
          height:26px;
          font-size:13px;
          font-weight:700;
          border:2px solid #fff;
          box-shadow:0 2px 4px rgba(0,0,0,0.3);
        `;
        label.innerText = String(place.order);

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

      // Polyline (하루 경로)
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

      // ✅ Day 라벨 표시
      if (
        dayBounds &&
        typeof dayBounds.getCenter === "function" &&
        !dayBounds.isEmpty()
      ) {
        const center = dayBounds.getCenter();
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

        new kakao.maps.CustomOverlay({
          content: label,
          position: center,
          yAnchor: -0.5,
          map,
        });
      }
    });

    setDayDistances(distances);
    dayBoundsRef.current = bounds;
    if (!allBounds.isEmpty()) map.setBounds(allBounds);
  }, [loaded, plan, dayKeys]);

  // Day 포커스 처리
  useEffect(() => {
    if (!focusDay || !mapRef.current || !dayBoundsRef.current[focusDay]) return;

    const map = mapRef.current;
    const bounds = dayBoundsRef.current[focusDay];

    if (bounds && !bounds.isEmpty()) {
      map.setBounds(bounds);
      // 약간 줌 아웃 (여유 공간)
      setTimeout(() => {
        const currentLevel = map.getLevel();
        map.setLevel(currentLevel + 1);
      }, 300);
    }

    // 포커스 완료 알림
    if (onFocusComplete) {
      setTimeout(() => onFocusComplete(), 500);
    }
  }, [focusDay, onFocusComplete]);

  const totalDistance = Object.values(dayDistances).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="font-bold text-lg text-gray-900">여행 경로 미리보기</h3>

        {/* Day 색상 범례 */}
        <div className="flex flex-wrap gap-2 justify-end">
          {dayKeys.map((day, idx) => (
            <div
              key={day}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColorForDay(idx) }}
              />
              <span className="text-gray-700">Day {day}</span>
            </div>
          ))}
        </div>
      </div>

      {totalDistance > 0 && (
        <div className="mb-3 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
          총 이동거리: {(totalDistance / 1000).toFixed(2)} km
        </div>
      )}

      <div
        id="kakao-multi-route-map"
        className="w-full h-[520px] border border-gray-200 rounded-xl shadow-md"
      />

      {!loaded && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>지도를 불러오는 중...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

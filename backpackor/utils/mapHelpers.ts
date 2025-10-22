// 지도 관련 유틸리티 함수
import { ROUTE_COLORS } from "@/constants/map";
import type { DayPlace } from "@/types/map";

/** Day 인덱스에 따른 색상 반환 */
export const getColorForDay = (dayIndex: number): string => {
  return ROUTE_COLORS[dayIndex % ROUTE_COLORS.length];
};

/** 두 좌표 간 거리 계산 (Haversine formula) */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** 유효한 좌표를 가진 장소만 필터링 */
export const filterValidCoords = (places: DayPlace[]): DayPlace[] => {
  return places.filter(
    (p) =>
      typeof p.latitude === "number" &&
      typeof p.longitude === "number" &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude)
  );
};

/** Day 키를 정렬하여 반환 */
export const getSortedDayKeys = (plan: Record<number, DayPlace[]>): number[] => {
  if (!plan || typeof plan !== "object") {
    return [];
  }
  return Object.keys(plan)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
};

/** 총 거리 계산 */
export const calculateTotalDistance = (dayDistances: Record<number, number>): number => {
  return Object.values(dayDistances).reduce((sum, distance) => sum + distance, 0);
};

/** 거리를 km 단위로 포맷 */
export const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

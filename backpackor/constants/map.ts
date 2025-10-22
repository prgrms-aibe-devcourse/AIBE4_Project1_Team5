// 지도 관련 상수

/** Day별 경로 색상 팔레트 */
export const ROUTE_COLORS = [
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
] as const;

/** 기본 지도 설정 */
export const DEFAULT_MAP_CONFIG = {
  center: {
    lat: 37.5665,
    lng: 126.978,
  },
  level: 7,
} as const;

/** 마커 스타일 설정 */
export const MARKER_STYLE = {
  width: 26,
  height: 26,
  fontSize: 13,
  borderWidth: 2,
} as const;

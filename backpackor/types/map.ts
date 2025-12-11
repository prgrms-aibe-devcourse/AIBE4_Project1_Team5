// 지도 관련 타입 정의

/** 하루 일정의 장소 정보 */
export interface DayPlace {
  order: number;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/** Day별 장소 목록 (전체 여행 계획) */
export type DayPlan = Record<number, DayPlace[]>;

/** Kakao 지도 Props */
export interface KakaoMapProps {
  plan?: DayPlan;
  kakaoApiKey?: string;
  focusDay?: number | null;
  onFocusComplete?: () => void;
  onShowAll?: () => void;
}

/** Kakao SDK 로드 상태 */
export interface KakaoLoaderState {
  loaded: boolean;
  error: string | null;
}

/** Day별 거리 정보 */
export type DayDistances = Record<number, number>;

/** Kakao Maps 전역 타입 */
declare global {
  interface Window {
    kakao: {
      maps: unknown;
      [key: string]: unknown;
    };
  }
}

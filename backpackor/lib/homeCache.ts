// 메인 페이지 여행지 캐시 관리 유틸리티
import type { Place } from "@/types/place";

interface HomeCacheData {
  popularPlaces: Place[];
  bestPlaces: Place[];
  timestamp: number;
}

const CACHE_KEY = "home_places_cache";
const CACHE_DURATION = 1000 * 60 * 30; // 30분

export class HomeCache {
  /**
   * 캐시에서 메인 페이지 데이터 읽기
   */
  static get(): { popularPlaces: Place[]; bestPlaces: Place[] } | null {
    try {
      if (typeof window === "undefined") return null;

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: HomeCacheData = JSON.parse(cached);

      // 캐시 만료 확인
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return {
        popularPlaces: data.popularPlaces,
        bestPlaces: data.bestPlaces,
      };
    } catch (error) {
      console.error("메인 페이지 캐시 읽기 오류:", error);
      return null;
    }
  }

  /**
   * 캐시에 메인 페이지 데이터 저장
   */
  static set(popularPlaces: Place[], bestPlaces: Place[]): void {
    try {
      if (typeof window === "undefined") return;

      const data: HomeCacheData = {
        popularPlaces,
        bestPlaces,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("메인 페이지 캐시 저장 오류:", error);
    }
  }

  /**
   * 캐시 삭제
   */
  static clear(): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("메인 페이지 캐시 삭제 오류:", error);
    }
  }
}

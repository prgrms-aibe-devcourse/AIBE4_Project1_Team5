// 여행지 캐시 관리 유틸리티
import type { Place } from "@/types/place";

interface CacheChunk {
  data: Place[];
  sortBy: string;
  filters: string; // 필터를 JSON 문자열로 저장
  timestamp: number;
}

const CHUNK_SIZE = 1500;
const CACHE_KEY_PREFIX = "place_cache_";
const CACHE_DURATION = 1000 * 60 * 30; // 30분

export class PlaceCache {
  /**
   * 캐시 키 생성 (sortBy + filters를 조합)
   */
  private static getCacheKey(
    sortBy: string,
    filters?: string,
    chunkIndex: number = 0
  ): string {
    return `${CACHE_KEY_PREFIX}${sortBy}_${filters || "all"}_chunk_${chunkIndex}`;
  }

  /**
   * 필터를 문자열로 직렬화
   */
  private static serializeFilters(filters?: any): string {
    if (!filters) return "all";
    return JSON.stringify(filters);
  }

  /**
   * 청크 인덱스 계산 (페이지 번호 -> 청크 인덱스)
   */
  private static getChunkIndex(page: number, limit: number): number {
    const offset = (page - 1) * limit;
    return Math.floor(offset / CHUNK_SIZE);
  }

  /**
   * 캐시에서 데이터 읽기
   */
  static getChunk(
    sortBy: string,
    filters: any,
    chunkIndex: number
  ): Place[] | null {
    try {
      const key = this.getCacheKey(sortBy, this.serializeFilters(filters), chunkIndex);
      const cached = localStorage.getItem(key);

      if (!cached) return null;

      const chunk: CacheChunk = JSON.parse(cached);

      // 캐시 만료 확인
      if (Date.now() - chunk.timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      // 정렬과 필터가 일치하는지 확인
      if (chunk.sortBy !== sortBy || chunk.filters !== this.serializeFilters(filters)) {
        return null;
      }

      return chunk.data;
    } catch (error) {
      console.error("캐시 읽기 오류:", error);
      return null;
    }
  }

  /**
   * 가장 오래된 캐시 삭제 (LRU)
   */
  private static clearOldestCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

      if (cacheKeys.length === 0) return;

      // 각 캐시의 타임스탬프를 읽어서 정렬
      const keyTimestamps = cacheKeys
        .map((key) => {
          try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            const chunk: CacheChunk = JSON.parse(cached);
            return { key, timestamp: chunk.timestamp };
          } catch {
            return null;
          }
        })
        .filter((item) => item !== null) as { key: string; timestamp: number }[];

      // 타임스탬프 기준으로 오름차순 정렬 (오래된 것부터)
      keyTimestamps.sort((a, b) => a.timestamp - b.timestamp);

      // 가장 오래된 10개의 캐시 삭제
      const keysToRemove = keyTimestamps.slice(0, 10).map((item) => item.key);
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      console.log(`오래된 캐시 ${keysToRemove.length}개 삭제됨`);
    } catch (error) {
      console.error("오래된 캐시 삭제 오류:", error);
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  static setChunk(
    sortBy: string,
    filters: any,
    chunkIndex: number,
    data: Place[]
  ): void {
    try {
      const key = this.getCacheKey(sortBy, this.serializeFilters(filters), chunkIndex);
      const chunk: CacheChunk = {
        data,
        sortBy,
        filters: this.serializeFilters(filters),
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(chunk));
    } catch (error) {
      console.error("캐시 저장 오류:", error);
      // localStorage가 가득 찬 경우 LRU 전략으로 오래된 캐시 삭제
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.log("localStorage 용량 초과, 오래된 캐시 삭제 시도...");
        this.clearOldestCache();

        // 다시 한 번 저장 시도
        try {
          localStorage.setItem(key, JSON.stringify({
            data,
            sortBy,
            filters: this.serializeFilters(filters),
            timestamp: Date.now(),
          }));
          console.log("캐시 저장 성공");
        } catch (retryError) {
          console.error("캐시 재저장 실패:", retryError);
          // 재시도도 실패하면 모든 캐시 삭제
          this.clearAllCache();
        }
      }
    }
  }

  /**
   * 페이지에 해당하는 데이터 가져오기
   */
  static getPageData(
    sortBy: string,
    filters: any,
    page: number,
    limit: number
  ): Place[] | null {
    const chunkIndex = this.getChunkIndex(page, limit);
    const chunk = this.getChunk(sortBy, filters, chunkIndex);

    if (!chunk) return null;

    // 청크 내에서 실제 페이지 데이터 추출
    const chunkOffset = (page - 1) * limit - chunkIndex * CHUNK_SIZE;
    return chunk.slice(chunkOffset, chunkOffset + limit);
  }

  /**
   * 특정 정렬/필터 조건의 모든 캐시 삭제
   */
  static clearCache(sortBy: string, filters: any): void {
    try {
      const filterStr = this.serializeFilters(filters);
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (
          key.startsWith(CACHE_KEY_PREFIX) &&
          key.includes(sortBy) &&
          key.includes(filterStr)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("캐시 삭제 오류:", error);
    }
  }

  /**
   * 모든 여행지 캐시 삭제
   */
  static clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("전체 캐시 삭제 오류:", error);
    }
  }

  /**
   * 청크 크기 반환
   */
  static getChunkSize(): number {
    return CHUNK_SIZE;
  }
}

// 여행지 관련 타입 정의

/** 여행지 기본 타입 (DB place 테이블) */
export interface Place {
  place_id: string; // UUID
  place_name: string; // 여행지 이름
  place_address?: string | null; // 주소
  place_description?: string | null; // 설명
  place_image?: string | null; // 대표 이미지
  average_rating?: number | null; // 평균 평점
  favorite_count?: number | null; // 좋아요 수
  review_count?: number | null; // 리뷰 수
  region_id?: number | null; // 지역 FK (region 테이블의 PK)
  place_category?: string | null; // 카테고리
  latitude?: number | null; // 위도
  longitude?: number | null; // 경도
  visit_order?: number; // 당일 방문 순서 (플래너용)
  day_number?: number; // Day 번호 (플래너용)
  place_type?: string | null; // 장소 타입
}

/** 여행지 상세 정보 (필수 필드만 포함) */
export interface PlaceDetail {
  place_id: string;
  place_name: string;
  place_address: string;
  place_description: string;
  place_image: string;
  place_category: string;
  latitude: number;
  longitude: number;
  average_rating: number;
  favorite_count: number;
  region_id: number;
  place_type: string;
}

/** 여행지 요약 정보 (목록/카드용) */
export interface PlaceSummary {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
}

/** 리뷰에서 사용하는 장소 정보 */
export interface PlaceInfo {
  place_name: string;
  place_address: string;
  place_image: string;
}

/** 여행 계획 데이터 구조 (Day별로 Place 배열 저장) */
export type Plan = Record<number, Place[]>;

// type/place.ts

/** 여행지 기본 타입 */
export interface Place {
  place_id: string; // UUID
  place_name: string; // 여행지 이름
  place_address?: string | null; // 주소
  place_description?: string | null; // 설명
  place_image?: string | null; // 대표 이미지
  place_detail_image?: string | null; // 상세 이미지
  average_rating?: number | null; // 평균 평점
  favorite_count?: number | null; // 좋아요 수
  review_count?: number | null; // 리뷰 수
  region_id?: string | null; // 지역 FK
  region?: string | null; // 지역 이름 (region 테이블에서 join)
  place_category?: string | null; // 카테고리
  latitude?: number | null; // 위도
  longitude?: number | null; // 경도
  visit_order?: number; // 당일 방문 순서
  day_number?: number; // Day 번호
}

/** 여행 계획 데이터 구조 (Day별로 Place 배열 저장) */
export type Plan = Record<number, Place[]>;

/** 여행 일정 세션 저장 시 사용하는 타입 */
export interface PlannerDraft {
  tripIdToEdit: string | null;
  tripTitle: string;
  startDateStr: string;
  endDateStr: string;
  plan: Plan;
}

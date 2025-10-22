// 여행 계획 관련 타입 정의

/** 여행 계획 기본 타입 (DB trip_plan 테이블) */
export interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
  user_id?: string | null;
}

/** 여행 계획 상세 정보 (DB trip_plan_detail 테이블) */
export interface TripPlanDetail {
  day_number: number;
  visit_order: number | string | null;
  place_id: string;
  trip_id?: number;
}

/** Day별로 그룹화된 여행 상세 정보 */
export type GroupedDetails = Record<number, TripPlanDetailWithPlace[]>;

/** Place 정보가 포함된 여행 상세 정보 */
export interface TripPlanDetailWithPlace extends Omit<TripPlanDetail, 'place_id'> {
  place: import('./place').Place;
}

// TripInfo는 planner.ts에 정의되어 있음
export type { TripInfo } from './planner';

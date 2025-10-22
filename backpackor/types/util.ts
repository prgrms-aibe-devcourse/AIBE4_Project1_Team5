// 유틸리티 관련 타입 정의

/** 쿼리 로그 */
export interface QueryLog {
  timestamp: string;
  query: string;
  params?: any;
  duration?: number;
}

/** Draft 타입 (플래너 미리보기) */
export interface Draft {
  tripIdToEdit: string | null;
  tripTitle: string;
  startDateStr: string;
  endDateStr: string;
  plan: import('./place').Plan;
}

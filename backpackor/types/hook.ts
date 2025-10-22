// Hook 반환 타입 및 파라미터 타입 정의
import type { Place, Plan } from './place';
import type { Review } from './review';

/** 활동 카운트 */
export interface ActivityCounts {
  reviewCount: number;
  planCount: number;
  favoriteCount: number;
}

// UserProfile은 user.ts에 정의되어 있음
export type { UserProfile } from './user';

/** 이미지 모달 Hook 반환 타입 */
export interface UseImageModalReturn {
  isOpen: boolean;
  currentIndex: number;
  openModal: (index: number) => void;
  closeModal: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

/** 지도 포커스 Hook Props */
export interface UseMapFocusProps {
  focusDay: number | null;
  plan: Record<number, any[]>;
  map: any;
  onFocusComplete?: () => void;
}

/** 카카오 지도 렌더러 Hook Props */
export interface UseKakaoMapRendererProps {
  map: any;
  plan: Record<number, Array<{ latitude: number; longitude: number; name: string; order: number }>>;
  focusDay: number | null;
  onFocusComplete?: () => void;
  onShowAll?: () => void;
}

/** 플래너 에디터 Hook Props */
export interface UsePlannerEditorProps {
  initialPlaces: Place[];
  existingTripTitle?: string;
  existingPlan?: Plan;
}

/** 리뷰 상세 Hook 반환 타입 */
export interface UseReviewDetailReturn {
  review: Review | null;
  images: string[];
  isLoading: boolean;
  error: string | null;
  userName: string;
  userProfileImage: string | null;
  isAuthor: boolean;
}

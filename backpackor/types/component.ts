// 컴포넌트 Props 관련 타입 정의
import type { Place } from './place';
import type { Review } from './review';
import type { TripPlan, TripPlanDetail, GroupedDetails } from './trip';
import type { Region } from './region';
import type { DragEndEvent } from '@dnd-kit/core';

/** 페이지 Props (동적 라우팅) */
export interface PageProps<T = Record<string, string>> {
  params: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/** 정렬 옵션 */
export interface SortOption {
  value: string;
  label: string;
}

/** 지역 필터 Props */
export interface RegionFilterProps {
  regions: Region[]; // Region은 region.ts에서 import됨
  selectedRegionId: number | null;
  onRegionChange: (regionId: number | null) => void;
}

// Region을 re-export
export type { Region } from './region';

/** 정렬 옵션 Props */
export interface SortOptionsProps {
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

/** 장소 카드 Props */
export interface PlaceCardProps {
  place: Place;
  onClick?: (placeId: string) => void;
}

/** 여행 리스트 아이템 Props */
export interface TravelListItemProps {
  place: Place;
  onAddPlace: (placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
}

/** 장소 그리드 Props */
export interface PlaceGridProps {
  places: Place[];
  onPlaceClick?: (placeId: string) => void;
}

/** 여행 리스트 컨테이너 Props */
export interface TravelListContainerProps {
  places: Place[];
  onAddPlace: (placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
  regionIds?: number[];
}

/** 장소 상세 모달 Props */
export interface PlaceDetailModalProps {
  placeId: string | null;
  onClose: () => void;
  showReviewButton?: boolean;
}

/** 장소 상세 컨텐츠 Props */
export interface PlaceDetailContentProps {
  place: Place;
  onClose: () => void;
  showReviewButton?: boolean;
}

/** 관련 장소 섹션 Props */
export interface RelatedPlacesSectionProps {
  currentPlaceId: string;
  regionId: number;
  onPlaceClick: (placeId: string) => void;
}

/** 여행 계획 카드 Props */
export interface TripPlanCardProps {
  plan: TripPlan;
}

/** 여행 상세 클라이언트 Props */
export interface TripDetailClientProps {
  plan: TripPlan;
  groupedDetails: GroupedDetails;
  onDayChange?: (day: number) => void;
}

/** 계획 리스트 Props */
export interface PlanListProps {
  plans: TripPlan[];
}

/** 즐겨찾기 버튼 Props */
export interface FavoriteButtonProps {
  placeId: string;
  userId: string | null;
  initialFavoriteCount?: number;
}

/** 로딩 스피너 Props */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

/** 소셜 로그인 버튼 Props */
export interface SocialLoginButtonProps {
  provider: 'kakao' | 'google';
  onClick: () => void;
}

/** 이미지 모달 Props */
export interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

/** 프로필 이미지 업로더 Props */
export interface ProfileImageUploaderProps {
  currentImage: string | null;
  onImageChange: (file: File) => void;
}

/** 프로필 정보 섹션 Props */
export interface ProfileInfoSectionProps {
  userName: string;
  userBio: string | null;
}

/** 프로필 수정 폼 Props */
export interface ProfileEditFormProps {
  userId: string;
}

/** 개인 정보 섹션 Props */
export interface PersonalInfoSectionProps {
  userId: string;
  userEmail: string;
}

/** 활동 섹션 Props */
export interface ActivitySectionProps {
  userId: string;
}

/** Day 탭 Props */
export interface DayTabsProps {
  days: number[];
  activeDay: number;
  onDayChange: (day: number) => void;
}

/** 플래너 헤더 Props */
export interface PlannerHeaderProps {
  isEditMode: boolean;
}

/** 플래너 제목 입력 Props */
export interface PlannerTitleInputProps {
  tripTitle: string;
  startDate: string;
  endDate: string;
  onTitleChange: (title: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  showDateInputs: boolean;
}

/** 플래너 액션 Props */
export interface PlannerActionsProps {
  isSaving: boolean;
  onPreview: () => void;
}

/** Day 계획 리스트 Props */
export interface DayPlanListProps {
  activeDay: number;
  places: Place[];
  onRemove: (placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

/** Sortable 아이템 Props */
export interface SortableItemProps {
  id: string;
  place: Place;
  index: number;
  onRemove: (placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
}

/** 지도 거리 정보 Props */
export interface MapDistanceInfoProps {
  totalDistance: number;
  totalDuration: number;
}

/** 지도 범례 Props */
export interface MapLegendProps {
  days: number[];
  colors: string[];
  activeDay: number | null;
  onDayClick: (day: number) => void;
}

/** 지도 로딩 상태 Props */
export interface MapLoadingStateProps {
  message?: string;
}

/** 리뷰 액션 바 Props */
export interface ReviewActionBarProps {
  reviewId: string;
}

/** 뒤로가기 버튼 Props */
export interface BackButtonProps {
  href: string;
}

/** 리뷰 컨텐츠 Props */
export interface ReviewContentProps {
  review: Review;
}

/** 리뷰 상세 헤더 Props */
export interface ReviewDetailHeaderProps {
  userName: string;
  userProfileImage: string | null;
  rating: number;
  createdAt: string;
  isAuthor: boolean;
  reviewId: string;
}

/** 리뷰 이미지 갤러리 Props */
export interface ReviewImageGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
}

/** 여행 리뷰 섹션 Props */
export interface TravelReviewSectionProps {
  placeId: string;
  userId: string | null;
}

/** 프로필이 포함된 리뷰 */
export interface ReviewWithProfile extends Review {
  user_name: string;
  user_profile_image: string | null;
}

/** 여행 상세 리뷰 폼 Props */
export interface TripDetailReviewFormProps {
  placeId: string;
  userId: string;
  onReviewSubmit: () => void;
}

/** 도움됨 버튼 Props */
export interface HelpfulButtonProps {
  reviewId: string;
  userId: string | null;
  initialHelpfulCount?: number;
}

/** 리뷰 작성 버튼 Props */
export interface WriteButtonProps {
  placeId: string;
  userId: string | null;
}

/** 리뷰 수정 버튼 Props */
export interface EditButtonProps {
  reviewId: string;
  isAuthor: boolean;
}

/** 리뷰 삭제 버튼 Props */
export interface DeleteButtonProps {
  reviewId: string;
  isAuthor: boolean;
  onDeleteSuccess: () => void;
}

/** 리뷰 액션 버튼 Props */
export interface ReviewActionButtonsProps {
  placeId: string;
  reviewId: string;
  userId: string | null;
  isAuthor: boolean;
  onDeleteSuccess: () => void;
}

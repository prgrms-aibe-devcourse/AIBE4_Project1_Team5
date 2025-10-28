// 플래너 관련 유틸리티 함수들
import { differenceInDays, addDays, format } from "date-fns";
import type { Place, Plan } from "@/types/place";
import type { DayInfo, ValidationResult, TripInfo } from "@/types/planner";

/** number 또는 null로 변환 */
export const toNumOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/** Place 객체로 변환 (다양한 형태의 raw 데이터를 통일) */
export const coercePlace = (raw: any): Place => {
  const place_id =
    raw?.place_id ?? raw?.id ?? raw?.place?.place_id ?? raw?.place?.id ?? "";
  const place_name =
    raw?.place_name ??
    raw?.name ??
    raw?.place?.place_name ??
    raw?.place?.name ??
    "";

  return {
    place_id,
    place_name,
    place_address:
      raw?.place_address ?? raw?.address ?? raw?.place?.place_address ?? null,
    latitude: toNumOrNull(raw?.latitude ?? raw?.place?.latitude),
    longitude: toNumOrNull(raw?.longitude ?? raw?.place?.longitude),
    place_image:
      raw?.place_image ?? raw?.image ?? raw?.place?.place_image ?? "",
    average_rating: (raw?.average_rating as number | null) ?? null,
    favorite_count: (raw?.favorite_count as number | null) ?? null,
    review_count: (raw?.review_count as number | null) ?? null,
    place_description: null,
    region_id: null,
    place_category: null,
    visit_order: raw?.visit_order ?? undefined,
    day_number: raw?.day_number ?? undefined,
  };
};

/** 여행 기간 계산 (박/일) */
export const calculateTripInfo = (
  startDate: string | null,
  endDate: string | null
): TripInfo | null => {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return null;
  }

  const nights = differenceInDays(end, start);
  const days = nights + 1;

  return { nights, days };
};

/** Day 배열 생성 */
export const generateDays = (
  startDateStr: string | null,
  endDateStr: string | null
): DayInfo[] => {
  if (!startDateStr || !endDateStr) {
    return [];
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) {
    return [];
  }

  const duration = differenceInDays(end, start) + 1;

  return Array.from({ length: duration }, (_, i) => ({
    day: i + 1,
    date: format(addDays(start, i), "yyyy. MM. dd"),
  }));
};

/** 플랜 유효성 검증 */
export const validatePlan = (
  tripTitle: string,
  plan: Plan
): ValidationResult => {
  if (!tripTitle.trim()) {
    return { isValid: false, message: "여행 제목을 입력해주세요." };
  }

  const hasPlaces = Object.values(plan).some((arr) => arr.length > 0);
  if (!hasPlaces) {
    return { isValid: false, message: "최소 1개 이상의 장소를 추가해주세요." };
  }

  // 모든 Day에 최소 1개의 장소가 있는지 검증
  const dayKeys = Object.keys(plan).map(Number).sort((a, b) => a - b);
  for (const day of dayKeys) {
    if (!plan[day] || plan[day].length === 0) {
      return {
        isValid: false,
        message: `Day ${day}에 여행지를 최소 1개 이상 선택해주세요.`
      };
    }
  }

  return { isValid: true };
};

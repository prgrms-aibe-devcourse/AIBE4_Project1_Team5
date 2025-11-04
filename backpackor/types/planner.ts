// 플래너 관련 타입 정의
import type { Place, Plan } from "./place";

export interface DayInfo {
  day: number;
  date: string;
}

export interface PlannerDraft {
  tripIdToEdit: string | null;
  tripTitle: string;
  startDateStr: string;
  endDateStr: string;
  plan: Plan;
}

export interface SessionPlace {
  place_id: string;
  place_name: string;
  place_address?: string | null;
  place_image?: string | null;
  latitude: number | null;
  longitude: number | null;
  average_rating?: number | null;
  visit_order: number;
  day_number: number;
}

export type SessionPlan = Record<number, SessionPlace[]>;

export interface PlannerEditorProps {
  initialPlaces: Place[];
  regionIds?: number[];
  existingTripTitle?: string;
  existingPlan?: Plan;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface TripInfo {
  nights: number;
  days: number;
}

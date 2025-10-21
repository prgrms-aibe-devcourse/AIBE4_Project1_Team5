// /lib/service/plannerService.ts
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Plan, PlannerDraft } from "@/types/place";

/** 세션에 저장할 최소 필드 타입(미리보기에서 쓰는 키만) */
type SessionPlace = {
  place_id: string;
  place_name: string;
  latitude: number | null;
  longitude: number | null;
  visit_order: number;
  day_number: number;
};
type SessionPlan = Record<number, SessionPlace[]>;

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** 최소 필드만 sessionStorage에 저장 */
export function savePlanToSession(draft: PlannerDraft): boolean {
  try {
    const sessionPlan: SessionPlan = {};
    Object.keys(draft.plan).forEach((dayKey) => {
      const day = parseInt(dayKey, 10);
      const arr = draft.plan[day] ?? [];
      sessionPlan[day] = arr.map((p, idx) => ({
        place_id: p.place_id,
        place_name: p.place_name,
        latitude: toNumberOrNull(p.latitude),
        longitude: toNumberOrNull(p.longitude),
        visit_order: idx + 1,
        day_number: day,
      }));
    });

    const payload = {
      tripIdToEdit: draft.tripIdToEdit,
      tripTitle: draft.tripTitle,
      startDateStr: draft.startDateStr,
      endDateStr: draft.endDateStr,
      plan: sessionPlan,
    };

    sessionStorage.setItem("planner_draft", JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error("❌ sessionStorage 저장 실패:", e);
    return false;
  }
}

/** 세션에서 불러오기 (미리보기/지도에서 사용) */
export function loadPlanFromSession():
  | (Omit<PlannerDraft, "plan"> & { plan: SessionPlan })
  | null {
  try {
    const raw = sessionStorage.getItem("planner_draft");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const plan: SessionPlan = {};
    Object.keys(parsed.plan || {}).forEach((dayKey) => {
      const day = parseInt(dayKey, 10);
      plan[day] = (parsed.plan[day] ?? []).map((p: any, idx: number) => ({
        place_id: String(p.place_id),
        place_name: String(p.place_name ?? ""),
        latitude: toNumberOrNull(p.latitude),
        longitude: toNumberOrNull(p.longitude),
        visit_order: Number(p.visit_order ?? idx + 1),
        day_number: Number(p.day_number ?? day),
      }));
    });

    return {
      tripIdToEdit: parsed.tripIdToEdit ?? null,
      tripTitle: parsed.tripTitle ?? "",
      startDateStr: parsed.startDateStr ?? "",
      endDateStr: parsed.endDateStr ?? "",
      plan,
    };
  } catch (e) {
    console.error("❌ sessionStorage 로드 실패:", e);
    return null;
  }
}

/** DB 저장 (확정 단계) */
export async function savePlanToDB(draft: PlannerDraft): Promise<number> {
  const supabase = createBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  let tripId: number | null = draft.tripIdToEdit
    ? Number(draft.tripIdToEdit)
    : null;

  if (!tripId) {
    const { data: inserted, error } = await supabase
      .from("trip_plan")
      .insert([
        {
          user_id: userId,
          trip_title: draft.tripTitle,
          trip_start_date: draft.startDateStr,
          trip_end_date: draft.endDateStr,
        },
      ])
      .select("trip_id")
      .single();
    if (error) throw error;
    tripId = inserted?.trip_id as number;
  } else {
    const { error } = await supabase
      .from("trip_plan")
      .update({
        trip_title: draft.tripTitle,
        trip_start_date: draft.startDateStr,
        trip_end_date: draft.endDateStr,
      })
      .eq("trip_id", tripId);
    if (error) throw error;

    await supabase.from("trip_plan_detail").delete().eq("trip_id", tripId);
  }

  if (!tripId) throw new Error("trip_id 생성 실패");

  const dayKeys = Object.keys(draft.plan)
    .map(Number)
    .sort((a, b) => a - b);
  const rows = dayKeys.flatMap((day) =>
    (draft.plan[day] || []).map((p, i) => ({
      trip_id: tripId!,
      day_number: day,
      place_id: p.place_id,
      visit_order: i + 1,
    }))
  );

  if (rows.length) {
    const { error } = await supabase.from("trip_plan_detail").insert(rows);
    if (error) throw error;
  }

  return tripId;
}

/** 🔎 플랜 검증 — 이걸 import 해서 쓰세요 */
export function validatePlan(
  tripTitle: string,
  plan: Plan
): { isValid: boolean; message?: string } {
  if (!tripTitle.trim()) {
    return { isValid: false, message: "여행 제목을 입력해주세요." };
  }
  const hasPlaces = Object.values(plan).some((arr) => arr.length > 0);
  if (!hasPlaces) {
    return { isValid: false, message: "최소 1개 이상의 장소를 추가해주세요." };
  }
  return { isValid: true };
}

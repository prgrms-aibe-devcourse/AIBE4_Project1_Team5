// 플래너 CRUD API
import { createBrowserClient } from "@/lib/supabaseClient";
import type { PlannerDraft, SessionPlace, SessionPlan } from "@/types/planner";

// 세션에 플랜 저장
export const savePlanToSession = (draft: PlannerDraft): boolean => {
  try {
    const sessionPlan: SessionPlan = {};

    Object.keys(draft.plan).forEach((dayKey) => {
      const day = parseInt(dayKey, 10);
      const arr = draft.plan[day] ?? [];
      const sessionPlaces: SessionPlace[] = arr.map((p, idx) => ({
        place_id: p.place_id,
        place_name: p.place_name,
        place_address: p.place_address ?? null,
        place_image: p.place_image ?? null,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        average_rating: p.average_rating ?? null,
        visit_order: idx + 1,
        day_number: day,
      }));
      sessionPlan[day] = sessionPlaces;
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
  } catch (error) {
    console.error("세션 저장 실패:", error);
    return false;
  }
};

// 세션에서 플랜 불러오기
export const loadPlanFromSession = ():
  | (Omit<PlannerDraft, "plan"> & { plan: SessionPlan })
  | null => {
  try {
    const raw = sessionStorage.getItem("planner_draft");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const plan: SessionPlan = {};

    Object.keys(parsed.plan || {}).forEach((dayKey) => {
      const day = parseInt(dayKey, 10);
      const sessionPlaces: SessionPlace[] = (parsed.plan[day] ?? []).map((p: unknown, idx: number) => {
        const place = p as {
          place_id?: unknown;
          place_name?: unknown;
          place_address?: string | null;
          place_image?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          average_rating?: number | null;
          visit_order?: unknown;
          day_number?: unknown;
        };
        return {
          place_id: String(place.place_id),
          place_name: String(place.place_name ?? ""),
          place_address: place.place_address ?? null,
          place_image: place.place_image ?? null,
          latitude: place.latitude ?? null,
          longitude: place.longitude ?? null,
          average_rating: place.average_rating ?? null,
          visit_order: Number(place.visit_order ?? idx + 1),
          day_number: Number(place.day_number ?? day),
        };
      });
      plan[day] = sessionPlaces;
    });

    return {
      tripIdToEdit: parsed.tripIdToEdit ?? null,
      tripTitle: parsed.tripTitle ?? "",
      startDateStr: parsed.startDateStr ?? "",
      endDateStr: parsed.endDateStr ?? "",
      plan,
    };
  } catch (error) {
    console.error("세션 로드 실패:", error);
    return null;
  }
};

// DB에 플랜 저장
export const savePlanToDB = async (draft: PlannerDraft): Promise<number> => {
  const supabase = createBrowserClient();

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  let tripId: number | null = draft.tripIdToEdit
    ? Number(draft.tripIdToEdit)
    : null;

  // 새로운 여행 생성 또는 기존 여행 업데이트
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

    // 기존 세부 일정 삭제
    await supabase.from("trip_plan_detail").delete().eq("trip_id", tripId);
  }

  if (!tripId) {
    throw new Error("trip_id 생성 실패");
  }

  // 세부 일정 삽입
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

  if (rows.length > 0) {
    const { error } = await supabase.from("trip_plan_detail").insert(rows);
    if (error) throw error;
  }

  return tripId;
};

// 장소 좌표 정보 가져오기
export const fetchPlaceWithCoords = async (placeId: string) => {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("place")
      .select("place_id, place_name, place_address, latitude, longitude, place_image")
      .eq("place_id", placeId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };
  } catch (error) {
    console.error("장소 좌표 조회 실패:", error);
    return null;
  }
};

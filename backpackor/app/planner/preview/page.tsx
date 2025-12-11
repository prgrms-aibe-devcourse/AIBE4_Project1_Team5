"use client";

import KakaoMultiRouteMap from "@/components/map/KakaoMultiRouteMap";
import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import DayPlanView, { type DayPlan } from "@/components/planner/common/DayPlanView";
import { createBrowserClient } from "@/lib/supabaseClient";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Place, Plan } from "@/types";
import type { Draft } from "@/types/util";

export default function PreviewPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // sessionStorage에서 불러오기
  useEffect(() => {
    const raw = sessionStorage.getItem("planner_draft");
    if (!raw) {
      router.back();
      return;
    }
    try {
      const parsed: Draft = JSON.parse(raw);
      setDraft(parsed);
    } catch {
      router.back();
    }
  }, [router]);

  const nightsDays = useMemo(() => {
    if (!draft?.startDateStr || !draft?.endDateStr) return null;
    const start = parseISO(draft.startDateStr);
    const end = parseISO(draft.endDateStr);
    const nights = differenceInCalendarDays(end, start);
    const days = nights + 1;
    return { nights, days };
  }, [draft]);

  if (!draft) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dayKeys = Object.keys(draft.plan)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  const handleDayChange = (day: number) => {
    setFocusDay(day);
  };

  const handleFocusComplete = () => {
    // Day 포커스 완료 후에도 focusDay 유지 (줌 레벨 유지)
  };

  const handleShowAll = () => {
    setFocusDay(null);
  };

  // DayPlanView에서 사용할 데이터 변환
  const dayPlan: DayPlan = Object.fromEntries(
    Object.entries(draft.plan).map(([day, places]) => [
      Number(day),
      places.map((p) => ({
        place_id: p.place_id,
        place_name: p.place_name,
        place_address: p.place_address,
        place_image: p.place_image,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    ])
  );

  /** 확정하기(저장) → /my-planner/[trip_id] 로 이동 */
  const handleConfirm = async () => {
    try {
      setIsSaving(true);

      const supabase = createBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      let tripId: number | null = draft.tripIdToEdit
        ? Number(draft.tripIdToEdit)
        : null;

      if (!tripId) {
        const { data: inserted, error: planInsErr } = await supabase
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

        if (planInsErr) throw planInsErr;
        tripId = inserted?.trip_id as number;
      } else {
        const { error: planUpdErr } = await supabase
          .from("trip_plan")
          .update({
            trip_title: draft.tripTitle,
            trip_start_date: draft.startDateStr,
            trip_end_date: draft.endDateStr,
          })
          .eq("trip_id", tripId);
        if (planUpdErr) throw planUpdErr;

        const { error: delErr } = await supabase
          .from("trip_plan_detail")
          .delete()
          .eq("trip_id", tripId);
        if (delErr) throw delErr;
      }

      if (!tripId) throw new Error("trip_id 생성에 실패했습니다.");

      const rows = dayKeys.flatMap((day) =>
        (draft.plan[day] || []).map((p, idx) => ({
          trip_id: tripId!,
          day_number: day,
          place_id: p.place_id,
          visit_order: idx + 1,
        }))
      );

      if (rows.length > 0) {
        const { error: detailInsErr } = await supabase
          .from("trip_plan_detail")
          .insert(rows);
        if (detailInsErr) throw detailInsErr;
      }

      // 저장 성공 시 세션 스토리지에서 draft 삭제
      sessionStorage.removeItem("planner_draft");

      router.replace(`/my-planner/${tripId}`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "";
      console.error(e);
      alert(`저장 중 오류가 발생했습니다.\n${errorMessage}`);
    } finally{
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">편집으로 돌아가기</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? "저장 중..." : "확정하기"}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
            {draft.tripTitle || "여행 미리보기"}
          </h1>

          {draft.startDateStr && draft.endDateStr && (
            <p className="mt-2 text-gray-700">
              <span className="font-medium">
                {format(parseISO(draft.startDateStr), "M월 d일", {
                  locale: ko,
                })}{" "}
                -{" "}
                {format(parseISO(draft.endDateStr), "M월 d일", { locale: ko })}
              </span>
              {(() => {
                const nights = differenceInCalendarDays(
                  parseISO(draft.endDateStr),
                  parseISO(draft.startDateStr)
                );
                return nights >= 0 ? (
                  <span className="text-gray-500 ml-2">
                    ({nights}박 {nights + 1}일)
                  </span>
                ) : null;
              })()}
            </p>
          )}
        </div>

        {/* 좌측 Day 리스트 & 지도 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            {/* Day 탭 + Day별 장소 리스트 */}
            <DayPlanView
              plan={dayPlan}
              onDayChange={handleDayChange}
              onPlaceClick={setSelectedPlaceId}
            />
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
              <KakaoMultiRouteMap
                plan={
                  Object.fromEntries(
                    Object.entries(draft.plan).map(([day, places]) => [
                      day,
                      places.map((p, idx) => ({
                        order: idx + 1,
                        id: p.place_id,
                        name: p.place_name,
                        latitude: Number(p.latitude),
                        longitude: Number(p.longitude),
                      })),
                    ])
                  ) as any
                }
                kakaoApiKey={process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}
                focusDay={focusDay}
                onFocusComplete={handleFocusComplete}
                onShowAll={handleShowAll}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 여행지 상세 모달 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}
    </div>
  );
}

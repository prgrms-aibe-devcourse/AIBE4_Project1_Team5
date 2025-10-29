"use client";

import KakaoMultiRouteMap from "@/components/map/KakaoMultiRouteMap";
import { createBrowserClient } from "@/lib/supabaseClient";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import type { Place, Plan } from "@/types";
import type { Draft } from "@/types/util";

// ✅ 지도 색상 팔레트 (index 맞춤)
const ROUTE_COLORS = [
  "#2563EB", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
  "#22C55E", // green
  "#06B6D4", // cyan
  "#E11D48", // rose
];

export default function PreviewPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const dayRefsRef = useRef<Record<number, HTMLElement | null>>({});

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
      const firstDay =
        Object.keys(parsed.plan)
          .map((n) => parseInt(n, 10))
          .sort((a, b) => a - b)[0] || 1;
      setActiveDay(firstDay);
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
  const activePlaces = draft.plan[activeDay] || [];

  const handleDayChange = (day: number) => {
    setActiveDay(day);
    setFocusDay(day);

    // 해당 Day 섹션으로 스크롤
    const dayElement = dayRefsRef.current[day];
    if (dayElement) {
      const headerOffset = 200; // sticky 헤더 높이 + 여유 공간
      const elementPosition = dayElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleFocusComplete = () => {
    // Day 포커스 완료 후에도 focusDay 유지 (줌 레벨 유지)
    // setFocusDay(null); 제거
  };

  const handleShowAll = () => {
    setFocusDay(null);
    // activeDay는 변경하지 않음 (현재 선택된 Day 유지)
  };

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

      router.replace(`/my-planner/${tripId}`);
    } catch (e: any) {
      console.error(e);
      alert(`저장 중 오류가 발생했습니다.\n${e?.message ?? ""}`);
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
            {/* Sticky 헤더: Day 탭 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6 z-10 mb-4">
              {/* Day 탭 색상 일치 */}
              <div className="flex gap-2 flex-wrap">
                {dayKeys.map((day, idx) => {
                  const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayChange(day)}
                      style={{
                        backgroundColor: activeDay === day ? color : "white",
                        color: activeDay === day ? "white" : "#374151",
                        border:
                          activeDay === day
                            ? `2px solid ${color}`
                            : "2px solid #E5E7EB",
                        boxShadow:
                          activeDay === day
                            ? "0 0 6px rgba(0,0,0,0.15)"
                            : "none",
                      }}
                      className="px-5 py-2.5 rounded-xl font-semibold transition-all"
                    >
                      Day {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day별 장소 리스트 */}
            <div className="space-y-6">
              {dayKeys.map((day) => {
                const places = draft.plan[day] || [];
                const color = ROUTE_COLORS[(day - 1) % ROUTE_COLORS.length];

                return (
                  <div
                    key={day}
                    ref={(el) => {
                      dayRefsRef.current[day] = el;
                    }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                  >
                    <h3
                      className="text-2xl font-bold mb-4"
                      style={{ color }}
                    >
                      Day {day}
                    </h3>

                    <div className="space-y-3">
                      {places.length > 0 ? (
                        places.map((place, idx) => (
                          <div
                            key={place.place_id}
                            className="relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
                          >
                            {/* 왼쪽 색상 바 */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: color }}
                            />

                            <div
                              className="w-10 h-10 flex items-center justify-center text-white rounded-full font-bold text-base shadow-sm flex-shrink-0 ml-2"
                              style={{ backgroundColor: color }}
                            >
                              {idx + 1}
                            </div>

                            {place.place_image && (
                              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100">
                                <Image
                                  src={place.place_image}
                                  alt={place.place_name}
                                  fill
                                  sizes="80px"
                                  className="rounded-lg object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 mb-1 truncate">
                                {place.place_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-3">
                                {place.place_address && (
                                  <span className="truncate">
                                    {place.place_address}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <p className="text-base font-medium">
                            이 날짜에는 장소가 없어요
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
}

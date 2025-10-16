// app/planner/preview/page.tsx
"use client";

import KakaoMultiRouteMap from "@/component/map/KakaoMultiRouteMap";
import { createBrowserClient } from "@/lib/supabaseClient";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/** DB place 스키마와 맞춤 */
type Place = {
  place_id: string;
  place_name: string;
  place_image?: string | null;
  average_rating?: number | null;
  favorite_count?: number | null;

  // 지도 표시용 좌표 (place 테이블에 존재)
  latitude?: number | null;
  longitude?: number | null;

  place_address?: string | null;
};

type Plan = Record<number, Place[]>;

type Draft = {
  tripIdToEdit: string | null; // 수정 모드면 값 존재
  tripTitle: string;
  startDateStr: string; // yyyy-MM-dd
  endDateStr: string; // yyyy-MM-dd
  plan: Plan;
};

export default function PreviewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [mapFocusDay, setMapFocusDay] = useState<number | null>(null);

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

  /** 확정하기(저장) → /my-planner/[trip_id] 로 이동 */
  const handleConfirm = async () => {
    try {
      setIsSaving(true);

      // 로그인 사용자 (있다면 저장)
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;

      // trip_plan upsert (수정 또는 신규)
      let tripId: number | null = draft.tripIdToEdit
        ? Number(draft.tripIdToEdit)
        : null;

      if (!tripId) {
        // 신규 생성
        const { data: inserted, error: planInsErr } = await supabase
          .from("trip_plan")
          .insert([
            {
              user_id: userId, // RLS/NULL 허용에 맞춰 사용
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
        // 수정
        const { error: planUpdErr } = await supabase
          .from("trip_plan")
          .update({
            trip_title: draft.tripTitle,
            trip_start_date: draft.startDateStr,
            trip_end_date: draft.endDateStr,
          })
          .eq("trip_id", tripId);
        if (planUpdErr) throw planUpdErr;

        // 기존 상세 삭제 후 다시 삽입(간단하고 안전)
        const { error: delErr } = await supabase
          .from("trip_plan_detail")
          .delete()
          .eq("trip_id", tripId);
        if (delErr) throw delErr;
      }

      if (!tripId) throw new Error("trip_id 생성에 실패했습니다.");

      // trip_plan_detail 일괄 삽입
      // visit_order 는 DB가 자동(1,2,3,...) 처리한다는 요구사항에 맞춰 보내지 않음.
      const rows = dayKeys.flatMap((day) =>
        (draft.plan[day] || []).map((p) => ({
          trip_id: tripId!,
          day_number: day,
          place_id: p.place_id,
          // visit_order: X (DB에서 자동)
          // duration_minute: null (필요 시만)
        }))
      );

      if (rows.length > 0) {
        const { error: detailInsErr } = await supabase
          .from("trip_plan_detail")
          .insert(rows);
        if (detailInsErr) throw detailInsErr;
      }

      // 저장 완료 → 내 일정 상세로 리다이렉트
      router.replace(`/my-planner/${tripId}`);
    } catch (e: any) {
      console.error(e);
      alert(`저장 중 오류가 발생했습니다.\n${e?.message ?? ""}`);
    } finally {
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

            {/* 확정하기 버튼 */}
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

        {/* 레이아웃: 좌 = 일정, 우 = 지도(모든 Day 경로) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측: 일정(선택 Day 상세) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
              {/* Day 탭 */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {dayKeys.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                      activeDay === day
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>

              {/* 선택 Day 리스트 */}
              <div className="space-y-3">
                {activePlaces.length > 0 ? (
                  activePlaces.map((place, idx) => (
                    <div
                      key={place.place_id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold text-base shadow-sm flex-shrink-0">
                        {idx + 1}
                      </div>

                      {place.place_image && (
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={place.place_image}
                            alt={place.place_name}
                            fill
                            className="rounded-lg object-cover"
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
                          {typeof place.average_rating === "number" && (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-yellow-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {place.average_rating?.toFixed(1)}
                            </span>
                          )}
                          {typeof place.favorite_count === "number" && (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-rose-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {place.favorite_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">
                      선택한 Day에 장소가 없어요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측: 지도(전체 Day 경로 색상 구분) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

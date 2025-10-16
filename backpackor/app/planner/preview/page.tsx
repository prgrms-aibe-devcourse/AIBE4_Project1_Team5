// app/planner/preview/page.tsx
"use client";

import { createBrowserClient } from "@/lib/supabaseClient";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

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

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

/* Kakao SDK 로더 */
function useKakaoLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }
    if (!KAKAO_KEY) {
      console.warn("NEXT_PUBLIC_KAKAO_MAP_API_KEY가 없습니다.");
      return;
    }
    const id = "kakao-sdk";
    if (document.getElementById(id)) return;

    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    s.onload = () => window.kakao.maps.load(() => setLoaded(true));
    document.head.appendChild(s);
  }, []);

  return loaded;
}

/* Day별 고정 팔레트 */
const routeColors = [
  "#2563EB", // blue-600
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
  "#22C55E", // green-500
  "#06B6D4", // cyan-500
  "#E11D48", // rose-600
];
const colorForIndex = (i: number) => routeColors[i % routeColors.length];

/** 하나의 지도에 모든 Day 경로를 색 다르게 그리기 */
function KakaoMultiRouteMap({ plan }: { plan: Plan }) {
  const loaded = useKakaoLoader();
  const dayKeys = useMemo(
    () =>
      Object.keys(plan)
        .map((n) => parseInt(n, 10))
        .sort((a, b) => a - b),
    [plan]
  );

  useEffect(() => {
    if (!loaded) return;
    const container = document.getElementById("kakao-map");
    if (!container) return;

    const kakao = window.kakao;
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 기본(서울 시청)
      level: 7,
    });

    const allBounds = new kakao.maps.LatLngBounds();

    // Day별로 그리기
    dayKeys.forEach((day, idx) => {
      const places = plan[day] || [];
      // 위경도 있는 것만 사용
      const coords = places
        .filter(
          (p) =>
            typeof p.latitude === "number" && typeof p.longitude === "number"
        )
        .map((p) => ({
          p,
          latlng: new kakao.maps.LatLng(
            Number(p.latitude),
            Number(p.longitude)
          ),
        }));

      if (coords.length === 0) return;

      const color = colorForIndex(idx);
      const dayBounds = new kakao.maps.LatLngBounds();

      // 마커 + 넘버 오버레이
      coords.forEach((c, i) => {
        new kakao.maps.Marker({
          position: c.latlng,
          map,
        });

        // D{day}-{i+1} 라벨
        const el = document.createElement("div");
        el.style.cssText =
          "display:inline-flex;align-items:center;justify-content:center;padding:2px 6px;border-radius:9999px;color:#fff;font-weight:700;font-size:12px;box-shadow:0 1px 2px rgba(0,0,0,0.15);";
        el.style.background = color;
        el.innerText = `D${day}-${i + 1}`;

        new kakao.maps.CustomOverlay({
          content: el,
          position: c.latlng,
          yAnchor: 1.6,
          map,
        });

        dayBounds.extend(c.latlng);
        allBounds.extend(c.latlng);
      });

      // Polyline (해당 Day 색)
      const path = coords.map((c) => c.latlng);
      if (path.length > 1) {
        new kakao.maps.Polyline({
          map,
          path,
          strokeWeight: 5,
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });
      }

      // Day 라벨
      const center = dayBounds.getCenter();
      const label = document.createElement("div");
      label.style.cssText =
        "padding:4px 8px;border-radius:9999px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);color:#111827;font-size:12px;font-weight:600;";
      label.innerText = `Day ${day}`;
      new kakao.maps.CustomOverlay({
        content: label,
        position: center,
        yAnchor: -0.2,
        map,
      });
    });

    if (!allBounds.isEmpty()) {
      map.setBounds(allBounds);
    }
  }, [loaded, plan, dayKeys]);

  // 범례
  const hasAny = dayKeys.some((d) => (plan[d] || []).length > 0);

  return (
    <div className="w-full h-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          전체 경로 미리보기
        </h3>
        <div className="flex gap-2 flex-wrap">
          {dayKeys.map((day, idx) => (
            <span
              key={day}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border rounded-full px-2 py-1"
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: colorForIndex(idx) }}
              />
              Day {day}
            </span>
          ))}
        </div>
      </div>
      <div
        id="kakao-map"
        className="w-full h-[520px] rounded-xl border border-gray-200"
      />
      {!hasAny && (
        <p className="mt-3 text-sm text-gray-500">
          표시할 좌표가 없습니다. (장소에 위·경도가 필요)
        </p>
      )}
      {!KAKAO_KEY && (
        <p className="mt-3 text-sm text-amber-600">
          NEXT_PUBLIC_KAKAO_MAP_API_KEY가 설정되지 않았습니다. (카카오 JS 키
          필요)
        </p>
      )}
    </div>
  );
}

export default function PreviewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

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
              <KakaoMultiRouteMap plan={draft.plan} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

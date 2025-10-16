// app/planner/view/page.tsx
"use client";

import { createBrowserClient } from "@/lib/supabaseClient";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type Place = {
  place_id: string;
  place_name: string;
  place_image?: string | null;
  average_rating?: number | null;
  favorite_count?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  place_address?: string | null;
};

type Plan = Record<number, Place[]>;

type Trip = {
  trip_id: number;
  trip_title: string;
  trip_start_date: string; // yyyy-MM-dd
  trip_end_date: string; // yyyy-MM-dd
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

/* Day별 색상 팔레트 */
const routeColors = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#22C55E",
  "#06B6D4",
  "#E11D48",
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
    const container = document.getElementById("kakao-map-view");
    if (!container) return;

    const kakao = window.kakao;
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });

    const allBounds = new kakao.maps.LatLngBounds();

    dayKeys.forEach((day, idx) => {
      const places = plan[day] || [];
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
      if (!coords.length) return;

      const color = colorForIndex(idx);
      const dayBounds = new kakao.maps.LatLngBounds();

      coords.forEach((c, i) => {
        new kakao.maps.Marker({ position: c.latlng, map });

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

      if (coords.length > 1) {
        new kakao.maps.Polyline({
          map,
          path: coords.map((c) => c.latlng),
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

    if (!allBounds.isEmpty()) map.setBounds(allBounds);
  }, [loaded, plan, dayKeys]);

  const any = dayKeys.some((d) => (plan[d] || []).length > 0);
  return (
    <div className="w-full h-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">전체 경로</h3>
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
        id="kakao-map-view"
        className="w-full h-[520px] rounded-xl border border-gray-200"
      />
      {!any && (
        <p className="mt-3 text-sm text-gray-500">
          표시할 좌표가 없습니다. (장소에 위·경도가 필요)
        </p>
      )}
      {!KAKAO_KEY && (
        <p className="mt-3 text-sm text-amber-600">
          NEXT_PUBLIC_KAKAO_MAP_API_KEY가 설정되지 않았습니다.
        </p>
      )}
    </div>
  );
}

export default function PlannerViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [plan, setPlan] = useState<Plan>({});
  const [activeDay, setActiveDay] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // 저장된 일정 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tripIdParam = searchParams.get("trip_id");
        if (!tripIdParam) {
          setError("trip_id가 없습니다.");
          return;
        }

        // 1) trip_plan
        const { data: planData, error: planErr } = await supabase
          .from("trip_plan")
          .select("trip_id, trip_title, trip_start_date, trip_end_date")
          .eq("trip_id", tripIdParam)
          .single();

        if (planErr || !planData) {
          setError("일정을 찾을 수 없습니다.");
          return;
        }

        setTrip(planData as Trip);

        // 2) trip_plan_detail + place join
        const { data: details, error: detErr } = await supabase
          .from("trip_plan_detail")
          .select(
            `
            day_number,
            visit_order,
            place:place_id (
              place_id,
              place_name,
              place_image,
              average_rating,
              favorite_count,
              latitude,
              longitude,
              place_address
            )
          `
          )
          .eq("trip_id", planData.trip_id)
          .order("day_number", { ascending: true })
          .order("visit_order", { ascending: true });

        if (detErr) throw detErr;

        const grouped: Plan = {};
        (details || []).forEach((row: any) => {
          const d = Number(row.day_number);
          const place: Place | null = row.place;
          if (!place) return;
          if (!grouped[d]) grouped[d] = [];
          grouped[d].push(place);
        });

        setPlan(grouped);

        const firstDay =
          Object.keys(grouped)
            .map((n) => parseInt(n, 10))
            .sort((a, b) => a - b)[0] || 1;
        setActiveDay(firstDay);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 font-semibold">
            일정을 불러오지 못했어요.
          </p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const dayKeys = Object.keys(plan)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
  const activePlaces = plan[activeDay] || [];
  const nights = differenceInCalendarDays(
    parseISO(trip.trip_end_date),
    parseISO(trip.trip_start_date)
  );
  const days = nights + 1;

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
              <span className="font-medium">뒤로가기</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
            {trip.trip_title}
          </h1>

          <p className="mt-2 text-gray-700">
            <span className="font-medium">
              {format(parseISO(trip.trip_start_date), "M월 d일", {
                locale: ko,
              })}{" "}
              -{" "}
              {format(parseISO(trip.trip_end_date), "M월 d일", { locale: ko })}
            </span>
            {nights >= 0 && (
              <span className="text-gray-500 ml-2">
                ({nights}박 {days}일)
              </span>
            )}
          </p>
        </div>

        {/* 레이아웃: 좌 = 일정, 우 = 지도 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측: 일정(선택 Day 상세) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
              {/* Day 탭 */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {dayKeys.length > 0 ? (
                  dayKeys.map((day) => (
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
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    등록된 일정이 없습니다.
                  </span>
                )}
              </div>

              {/* 선택 Day 리스트 */}
              <div className="space-y-3">
                {activePlaces.length > 0 ? (
                  activePlaces.map((place, idx) => (
                    <div
                      key={`${place.place_id}-${idx}`}
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
                        <div className="text-sm text-gray-500">
                          {place.place_address || ""}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-yellow-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {place.average_rating?.toFixed(1) ?? "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-rose-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {place.favorite_count ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg
                      className="w-14 h-14 mb-4 text-gray-300"
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
              <KakaoMultiRouteMap plan={plan} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

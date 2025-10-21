// component/planner/PlannerEditor.tsx
"use client";

import PlaceDetailModal from "@/components/place/PlaceDetailModal";
import TravelListContainer from "@/components/place/TravelListContainer";
import { SortableItem } from "@/components/planner/SortableItem";
import { savePlanToSession, validatePlan } from "@/lib/service/plannerService";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Place, Plan } from "@/types/place";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { addDays, differenceInDays, format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DayInfo {
  day: number;
  date: string;
}

type PlannerEditorProps = {
  initialPlaces: Place[];
  regionOptions?: string[];
  existingTripTitle?: string;
  existingPlan?: Plan;
};

const toNumOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/** 공용 Place 형태로 변환 */
const coercePlace = (raw: any): Place => {
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
    place_detail_image: null,
    region_id: null,
    place_category: null,
    visit_order: raw?.visit_order ?? undefined,
    day_number: raw?.day_number ?? undefined,
  };
};

/** DB에서 6개 컬럼만 조회 (좌표용) */
async function fetchPlaceWithCoords(place_id: string) {
  try {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("place")
      .select(
        `place_id, place_name, place_address, latitude, longitude, place_image`
      )
      .eq("place_id", place_id)
      .single();

    return data
      ? {
          ...data,
          latitude: toNumOrNull(data.latitude),
          longitude: toNumOrNull(data.longitude),
        }
      : null;
  } catch {
    return null;
  }
}

export default function PlannerEditor({
  initialPlaces = [],
  regionOptions = [],
  existingTripTitle = "",
  existingPlan = {},
}: PlannerEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tripIdToEdit = searchParams.get("trip_id");
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  // [추가] URL 파라미터로 날짜 상태를 초기화합니다.
  const [startDate, setStartDate] = useState(startDateStr);
  const [endDate, setEndDate] = useState(endDateStr);

  const [tripTitle, setTripTitle] = useState(existingTripTitle);
  const [plan, setPlan] = useState<Plan>(existingPlan);
  const [activeDay, setActiveDay] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // const days: DayInfo[] = useMemo(() => {
  //   if (!startDateStr || !endDateStr) return [];
  //   const start = new Date(startDateStr);
  //   const end = new Date(endDateStr);
  //   const duration = differenceInDays(end, start) + 1;
  //   return Array.from({ length: duration }, (_, i) => ({
  //     day: i + 1,
  //     date: format(addDays(start, i), "yyyy. MM. dd"),
  //   }));
  // }, [startDateStr, endDateStr]);

  const days: DayInfo[] = useMemo(() => {
    // [수정] startDateStr, endDateStr 대신 상태 변수 사용
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 종료일이 시작일보다 빠르면 빈 배열 반환
    if (start > end) return [];

    const duration = differenceInDays(end, start) + 1;
    return Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      date: format(addDays(start, i), "yyyy. MM. dd"),
    }));
    // [수정] 의존성 배열도 상태 변수로 변경
  }, [startDate, endDate]);

  // ✅ 새 일정 모드에서만 빈 day 배열 초기화
  useEffect(() => {
    if (tripIdToEdit) return; // 수정 모드에서는 실행하지 않음
    if (days.length === 0) return;

    setPlan((prev) => {
      // 이미 데이터가 있으면 건드리지 않음
      if (Object.keys(prev).length > 0) return prev;

      const next: Plan = {};
      for (const d of days) {
        next[d.day] = [];
      }
      return next;
    });

    if (activeDay < 1 || activeDay > days.length) {
      setActiveDay(1);
    }
  }, [days.length, tripIdToEdit, activeDay]);

  // AI 추천 계획을 처리하기 위한 useEffect
  useEffect(() => {
    const aiGeneratedPlanStr = searchParams.get("aiPlan");
    const aiGeneratedTitle = searchParams.get("aiTitle");
    // URL에 aiPlan 데이터가 있을 경우에만 이 로직을 실행합니다.
    if (aiGeneratedPlanStr) {
      console.log("[PlannerEditor] AI가 생성한 계획을 적용합니다.");
      if (aiGeneratedTitle) {
        setTripTitle(aiGeneratedTitle);
      }
      const aiPlanData = JSON.parse(aiGeneratedPlanStr);
      const newPlan: Plan = {};
      for (const day in aiPlanData) {
        const dayNumber = parseInt(day, 10);
        if (!newPlan[dayNumber]) {
          newPlan[dayNumber] = [];
        }
        const placesForDay = aiPlanData[day]
          .map((p: { place_name: string }, index: number) => {
            const fullPlaceInfo = initialPlaces.find(
              (ip) => ip.place_name === p.place_name
            );
            if (fullPlaceInfo) {
              return {
                ...coercePlace(fullPlaceInfo),
                visit_order: index + 1,
                day_number: dayNumber,
              };
            }
            return null;
          })
          .filter((p: Place | null): p is Place => p !== null);
        newPlan[dayNumber] = placesForDay;
      }
      setPlan(newPlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // [추가] 날짜(days)가 변경될 때마다 plan 객체를 정리하는 useEffect
  useEffect(() => {
    // 날짜 정보가 없으면 아무것도 하지 않음
    if (days.length === 0) return;

    setPlan((prevPlan) => {
      const newPlan: Plan = {};
      const maxDay = days.length;

      // 존재하는 날짜에 대해서만 기존 계획을 복사
      for (let day = 1; day <= maxDay; day++) {
        newPlan[day] = prevPlan[day] || [];
      }

      return newPlan;
    });

    // 활성화된 Day가 유효한 범위를 벗어나면 첫째 날로 설정
    if (activeDay > days.length) {
      setActiveDay(1);
    }
  }, [days, activeDay]); // days 배열이 바뀔 때마다 이 로직 실행

  /** 장소 추가 */
  const handleAddPlace = async (rawPlace: Place, targetDay?: number) => {
    if (!days.length) return;

    const day = targetDay ?? activeDay;
    let place = coercePlace(rawPlace);

    if (place.latitude == null || place.longitude == null) {
      const filled = await fetchPlaceWithCoords(place.place_id);
      if (filled) {
        place = { ...place, ...filled };
      }
    }

    if (!place.place_id) {
      alert("장소 정보가 올바르지 않습니다.");
      return;
    }

    setPlan((prev) => {
      const curr = prev[day] ?? [];
      if (curr.some((p) => p.place_id === place.place_id)) return prev;

      const nextDayList = [
        ...curr,
        { ...place, visit_order: curr.length + 1, day_number: day },
      ];
      return { ...prev, [day]: nextDayList };
    });
  };

  /** 장소 제거 */
  const handleRemovePlace = (day: number, placeId: string) => {
    setPlan((prev) => {
      const filtered = (prev[day] || []).filter((p) => p.place_id !== placeId);
      const reordered = filtered.map((p, i) => ({
        ...p,
        visit_order: i + 1,
        day_number: day,
      }));
      return { ...prev, [day]: reordered };
    });
  };

  /** DnD 정렬 */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPlan((prev) => {
      const list = prev[activeDay] || [];
      const oldIndex = list.findIndex((p) => p.place_id === active.id);
      const newIndex = list.findIndex((p) => p.place_id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;

      const reordered = arrayMove(list, oldIndex, newIndex).map((p, i) => ({
        ...p,
        visit_order: i + 1,
        day_number: activeDay,
      }));

      return { ...prev, [activeDay]: reordered };
    });
  };

  const handlePreviewPlan = () => {
    const validation = validatePlan(tripTitle, plan);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setIsSaving(true);
    try {
      savePlanToSession({
        tripIdToEdit: tripIdToEdit ?? null,
        tripTitle,
        startDateStr: startDate || "",
        endDateStr: endDate || "",
        plan,
      });
      router.push("/planner/preview");
    } catch {
      alert("미리보기 데이터를 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ 로딩 중이 아니므로 바로 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
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

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {tripIdToEdit ? "여행 일정 수정" : "나만의 여행 만들기"}
          </h1>
          <p className="text-lg text-gray-600">
            원하는 장소를 추가하고 나만의 여행 일정을 계획해보세요
          </p>
        </div>

        {/* 제목/기간 */}
        <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-gray-200 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              여행 제목
            </label>
            <input
              type="text"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              placeholder="예: 제주도 힐링 여행"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            />
          </div>

          {startDateStr && endDateStr && (
            // <div className="flex items-center gap-3">
            //   <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            //     <svg
            //       className="w-6 h-6 text-blue-600"
            //       fill="none"
            //       stroke="currentColor"
            //       viewBox="0 0 24 24"
            //     >
            //       <path
            //         strokeLinecap="round"
            //         strokeLinejoin="round"
            //         strokeWidth={2}
            //         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            //       />
            //     </svg>
            //   </div>
            //   <div>
            //     <p className="text-sm text-gray-500 font-medium">여행 기간</p>
            //     <p className="text-base font-bold text-gray-900">
            //       {format(new Date(startDateStr), "M월 d일", { locale: ko })} -{" "}
            //       {format(new Date(endDateStr), "M월 d일", { locale: ko })}
            //     </p>
            //   </div>
            // </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                {
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                }
              </div>
              <div className="flex items-center gap-4 w-full">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate || ""}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="pt-6 font-bold text-gray-400">~</span>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={endDate || ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    // 시작일보다 이전 날짜는 선택할 수 없도록 설정
                    min={startDate || ""}
                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 왼쪽 (Day별 일정) */}
          <div className="lg:col-span-7">
            <div className="flex gap-2 mb-6 flex-wrap">
              {days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    activeDay === d.day
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Day {d.day}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Day {activeDay}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {plan[activeDay]?.length || 0}개 장소
                </span>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(plan[activeDay] ?? [])
                    .map((p) => p.place_id)
                    .filter((id): id is string => Boolean(id))}
                  strategy={verticalListSortingStrategy}
                >
                  {plan[activeDay] && plan[activeDay].length > 0 ? (
                    <div className="space-y-3">
                      {plan[activeDay].map((place) => (
                        <SortableItem
                          key={place.place_id}
                          place={place}
                          onRemove={() =>
                            handleRemovePlace(activeDay, place.place_id)
                          }
                          onClick={() => setSelectedPlaceId(place.place_id)}
                        />
                      ))}
                    </div>
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
                          d="M17.657 16.657L13.414 20.9a1 1 0 01-1.414 0L7.757 16.657a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-500 mb-1">
                        아직 선택한 장소가 없습니다.
                      </p>
                      <p className="text-sm text-gray-400">
                        오른쪽에서 원하는 장소를 추가해보세요.
                      </p>
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* 오른쪽 (장소 목록) */}
          <div className="lg:col-span-5">
            <TravelListContainer
              places={initialPlaces}
              onAddPlace={handleAddPlace}
              onPlaceClick={setSelectedPlaceId}
              regionOptions={regionOptions}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-end gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            취소
          </button>
          <button
            onClick={handlePreviewPlan}
            disabled={isSaving}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <span>일정 미리보기</span>
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}
    </div>
  );
}

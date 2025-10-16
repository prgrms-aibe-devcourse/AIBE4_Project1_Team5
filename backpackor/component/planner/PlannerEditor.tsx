// component/planner/PlannerEditor.tsx
"use client";

import PlaceDetailModal from "@/component/place/PlaceDetailModal";
import TravelListContainer from "@/component/place/TravelListContainer";
import { SortableItem } from "@/component/planner/SortableItem";
import { savePlanToSession, validatePlan } from "@/lib/service/plannerService";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Place, Plan } from "@/type/place";

import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { addDays, differenceInDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DayInfo {
  day: number;
  date: string;
}

// ✅ 1. Props 인터페이스에 initialRegion 추가
type PlannerEditorProps = {
  initialPlaces: Place[];
  initialRegion?: string; // 페이지 URL로부터 전달받을 초기 지역
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
    region: (raw as any).region ?? null, // region 정보 추가
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
  initialRegion, // ✅ 2. prop 받기
}: PlannerEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tripIdToEdit = searchParams.get("trip_id");
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  const [tripTitle, setTripTitle] = useState("");
  const [plan, setPlan] = useState<Plan>({});
  const [activeDay, setActiveDay] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  // ✅ 3. 전달받은 장소 목록에서 중복을 제거한 지역 목록 생성
  const regionOptions = useMemo(() => {
    // initialPlaces에서 'region' 속성을 가져와 Set으로 중복을 제거 후 배열로 변환
    const regions = new Set(initialPlaces.map(p => (p as any).region).filter(Boolean));
    return Array.from(regions);
  }, [initialPlaces]);

  const days: DayInfo[] = useMemo(() => {
    if (!startDateStr || !endDateStr) return [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const duration = differenceInDays(end, start) + 1;
    return Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      date: format(addDays(start, i), "yyyy. MM. dd"),
    }));
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    setPlan((prev) => {
      const next: Plan = { ...prev };
      for (const d of days) if (!next[d.day]) next[d.day] = [];
      for (const k of Object.keys(next)) {
        const dn = Number(k);
        if (!days.some((d) => d.day === dn)) delete next[dn];
      }
      return next;
    });
    if (days.length > 0 && (activeDay < 1 || activeDay > days.length))
      setActiveDay(1);
  }, [days]);

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
        startDateStr: startDateStr || "",
        endDateStr: endDateStr || "",
        plan,
      });
      router.push("/planner/preview");
    } catch {
      alert("미리보기 데이터를 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
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
              <div>
                <p className="text-sm text-gray-500 font-medium">여행 기간</p>
                <p className="text-base font-bold text-gray-900">
                  {format(new Date(startDateStr), "M월 d일", { locale: ko })} -{" "}
                  {format(new Date(endDateStr), "M월 d일", { locale: ko })}
                </p>
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
            {/* ✅ 4. TravelListContainer에 prop 전달 */}
            <TravelListContainer
              places={initialPlaces}
              onAddPlace={handleAddPlace}
              onPlaceClick={setSelectedPlaceId}
              regionOptions={regionOptions}
              initialRegion={initialRegion}
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
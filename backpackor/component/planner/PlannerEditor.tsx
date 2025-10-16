"use client";

import { SortableItem } from "@/component/planner/SortableItem";
import { createBrowserClient } from "@/lib/supabaseClient";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { addDays, differenceInDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TravelListContainer from "@/component/place/TravelListContainer";

export interface Place {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
  favorite_count: number;
  review_count?: number;
}

interface DayInfo {
  day: number;
  date: string;
}

type Plan = Record<number, Place[]>;

type PlannerEditorProps = {
  initialPlaces: Place[];
};

export default function PlannerEditor({
  initialPlaces = [],
}: PlannerEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const tripIdToEdit = searchParams.get("trip_id");
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");
  const aiGeneratedTitle = searchParams.get("aiTitle");
  const aiGeneratedPlanStr = searchParams.get("aiPlan");

  const [tripTitle, setTripTitle] = useState(aiGeneratedTitle || "");
  const [plan, setPlan] = useState<Plan>({});
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 날짜 정보 계산
  let days: DayInfo[] = [];
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const duration = differenceInDays(end, start) + 1;
    days = Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      date: format(addDays(start, i), "yyyy. MM. dd"),
    }));
  }

  // 👇 디버깅을 위한 console.log
  console.log("시작일:", startDateStr);
  console.log("종료일:", endDateStr);
  console.log("계산된 여행 기간(days):", days);

  // 초기 데이터 로드
  useEffect(() => {
    const initializePlan = async () => {
      setIsLoading(true);

      if (aiGeneratedPlanStr) {
        const aiPlan = JSON.parse(aiGeneratedPlanStr);
        const hydratedPlan: Plan = {};
        for (const day in aiPlan) {
          hydratedPlan[parseInt(day, 10)] = aiPlan[day]
            .map((p: { place_name: string }) =>
              initialPlaces.find((ip) => ip.place_name === p.place_name)
            )
            .filter((p?: Place): p is Place => p !== undefined);
        }
        setPlan(hydratedPlan);
      } else if (tripIdToEdit) {
        const { data: planData } = await supabase
          .from("trip_plan")
          .select("trip_title")
          .eq("trip_id", tripIdToEdit)
          .single();
        if (planData) setTripTitle(planData.trip_title);

        const { data: details } = await supabase
          .from("trip_plan_detail")
          .select("day_number, place(*)")
          .eq("trip_id", tripIdToEdit);
        const newPlan: Plan = {};
        ((details as any[]) || []).forEach((detail) => {
          if (!newPlan[detail.day_number]) newPlan[detail.day_number] = [];
          newPlan[detail.day_number].push(detail.place);
        });
        setPlan(newPlan);
      }
      setIsLoading(false);
    };
    initializePlan();
  }, [aiGeneratedPlanStr, tripIdToEdit, initialPlaces, supabase]);

  // 장소 추가
  const handleAddPlace = (place: Place) => {
    const isDuplicate = plan[activeDay]?.some(
      (p) => p.place_id === place.place_id
    );
    if (isDuplicate) {
      alert("이미 추가된 장소입니다.");
      return;
    }

    setPlan((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), place],
    }));
  };

  // 장소 제거
  const handleRemovePlace = (day: number, placeId: string) => {
    setPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter((p) => p.place_id !== placeId),
    }));
  };

  // 드래그 앤 드롭
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlan((prev) => {
        const activeDayPlaces = prev[activeDay] || [];
        const oldIndex = activeDayPlaces.findIndex(
          (p) => p.place_id === active.id
        );
        const newIndex = activeDayPlaces.findIndex(
          (p) => p.place_id === over.id
        );
        return {
          ...prev,
          [activeDay]: arrayMove(activeDayPlaces, oldIndex, newIndex),
        };
      });
    }
  };

  // 미리보기로 이동
  const handlePreviewPlan = () => {
    if (!tripTitle.trim()) {
      alert("여행 제목을 입력해주세요.");
      return;
    }

    const hasPlaces = Object.values(plan).some((places) => places.length > 0);
    if (!hasPlaces) {
      alert("최소 1개 이상의 장소를 추가해주세요.");
      return;
    }

    const draft = {
      tripIdToEdit: tripIdToEdit ?? null,
      tripTitle,
      startDateStr,
      endDateStr,
      plan,
    };

    try {
      sessionStorage.setItem("planner_draft", JSON.stringify(draft));
      router.push("/planner/preview");
    } catch (e) {
      console.error("미리보기 데이터 저장 실패:", e);
      alert("미리보기 데이터를 저장하는 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            일정 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
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

        {/* 여행 제목 & 날짜 */}
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
            />
          </div>

          {startDateStr && endDateStr && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
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

        {/* ===== 레이아웃 스왑: 왼쪽=Day+일정, 오른쪽=여행지 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 왼쪽: Day 탭 + 일정(DnD) */}
          <div className="lg:col-span-7">
            {/* Day 탭 */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {days.map((dayInfo) => (
                <button
                  key={dayInfo.day}
                  onClick={() => setActiveDay(dayInfo.day)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    activeDay === dayInfo.day
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Day {dayInfo.day}
                </button>
              ))}
            </div>

            {/* 일정 카드 */}
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
                  items={(plan[activeDay] || []).map((p) => p.place_id)}
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
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="text-lg font-medium text-gray-500 mb-1">
                        아직 선택한 장소가 없어요
                      </p>
                      <p className="text-sm text-gray-400">
                        오른쪽에서 원하는 장소를 추가해보세요
                      </p>
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* 오른쪽: 여행지(정렬/검색/목록) */}
          <div className="lg:col-span-5">
            <TravelListContainer
              places={initialPlaces}
              onAddPlace={handleAddPlace}
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
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? "처리 중..." : "일정 미리보기"}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
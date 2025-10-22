// 플래너 에디터 컴포넌트
"use client";

import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import TravelListContainer from "@/components/place/list/TravelListContainer";
import { PlannerHeader } from "../ui/PlannerHeader";
import { PlannerTitleInput } from "../ui/PlannerTitleInput";
import { DayTabs } from "../ui/DayTabs";
import { DayPlanList } from "../ui/DayPlanList";
import { PlannerActions } from "../ui/PlannerActions";
import { usePlannerEditor } from "@/hooks/planner/usePlannerEditor";
import type { PlannerEditorProps } from "@/types/planner";

export default function PlannerEditor({
  initialPlaces = [],
  regionIds = [],
  existingTripTitle = "",
  existingPlan = {},
}: PlannerEditorProps) {
  const {
    tripIdToEdit,
    startDate,
    endDate,
    tripTitle,
    plan,
    activeDay,
    isSaving,
    selectedPlaceId,
    days,
    setStartDate,
    setEndDate,
    setTripTitle,
    setActiveDay,
    setSelectedPlaceId,
    handleAddPlace,
    handleRemovePlace,
    handleDragEnd,
    handlePreviewPlan,
  } = usePlannerEditor({
    initialPlaces,
    existingTripTitle,
    existingPlan,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <PlannerHeader isEditMode={!!tripIdToEdit} />

        {/* 제목 및 날짜 입력 */}
        <PlannerTitleInput
          tripTitle={tripTitle}
          startDate={startDate}
          endDate={endDate}
          onTitleChange={setTripTitle}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          showDateInputs={!!(startDate && endDate)}
        />

        {/* 본문 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 왼쪽: Day별 일정 */}
          <div className="lg:col-span-7">
            <DayTabs days={days} activeDay={activeDay} onDayChange={setActiveDay} />
            <DayPlanList
              activeDay={activeDay}
              places={plan[activeDay] || []}
              onRemove={(placeId) => handleRemovePlace(activeDay, placeId)}
              onPlaceClick={setSelectedPlaceId}
              onDragEnd={handleDragEnd}
            />
          </div>

          {/* 오른쪽: 장소 목록 */}
          <div className="lg:col-span-5">
            <TravelListContainer
              places={initialPlaces}
              onAddPlace={handleAddPlace}
              onPlaceClick={setSelectedPlaceId}
              regionIds={regionIds}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <PlannerActions isSaving={isSaving} onPreview={handlePreviewPlan} />
      </div>

      {/* 장소 상세 모달 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}
    </div>
  );
}

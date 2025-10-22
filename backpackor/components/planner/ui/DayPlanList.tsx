// Day별 장소 리스트 컴포넌트
"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Place } from "@/types/place";
import { SortableItem } from "../sortable/SortableItem";

interface DayPlanListProps {
  activeDay: number;
  places: Place[];
  onRemove: (placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export const DayPlanList = ({
  activeDay,
  places,
  onRemove,
  onPlaceClick,
  onDragEnd,
}: DayPlanListProps) => {
  // Early return: 장소가 없을 때
  if (places.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Day {activeDay}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            0개 장소
          </span>
        </div>
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Day {activeDay}</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
          {places.length}개 장소
        </span>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={places.map((p) => p.place_id).filter((id): id is string => Boolean(id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {places.map((place) => (
              <SortableItem
                key={place.place_id}
                place={place}
                onRemove={() => onRemove(place.place_id)}
                onClick={() => onPlaceClick(place.place_id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

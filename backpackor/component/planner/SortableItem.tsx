// component/planner/SortableItem.tsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Place } from "./PlannerEditor"; // PlannerEditor와 타입 공유

interface SortableItemProps {
  place: Place;
  onRemove: () => void;
  onClick: () => void;
}

export function SortableItem({ place, onRemove, onClick }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.place_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* 드래그 핸들 */}
        <div {...listeners} className="cursor-grab touch-none text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        {/* 장소 이미지 */}
        {place.place_image && (
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src={place.place_image}
              alt={place.place_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* 장소 정보 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">
            {place.place_name}
          </div>
          {/* --- 지역 정보 표시 --- */}
          <div className="text-xs text-gray-500 mt-1">{place.region}</div>
          <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
            <span>⭐ {place.average_rating?.toFixed(1) ?? "-"}</span>
            <span>❤️ {place.favorite_count ?? 0}</span>
          </div>
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭(모달 열기) 방지
            onRemove();
          }}
          className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
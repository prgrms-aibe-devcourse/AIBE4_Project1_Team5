// 파일 경로: component/planner/SortableItem.tsx (수정)

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Place } from "./PlannerEditor"; // Place 타입을 가져옵니다.

interface SortableItemProps {
  place: Place;
  onRemove: () => void;
}

export function SortableItem({ place, onRemove }: SortableItemProps) {
  // dnd-kit의 useSortable 훅을 사용해 드래그 기능을 구현합니다.
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // 드래그 중인지 여부를 알 수 있습니다.
  } = useSortable({ id: place.place_id });

  // 드래그 시 필요한 스타일
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // 드래그 중에 반투명 효과
  };

  return (
    // ref, style, attributes를 div에 적용해야 드래그가 정상적으로 동작합니다.
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm"
    >
      <div className="flex items-center gap-3">
        {/* 드래그 핸들: 이 아이콘을 잡고 드래그할 수 있습니다. */}
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

        {/* 장소 이름 및 정보 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">
            {place.place_name}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1">
              ⭐ {place.average_rating?.toFixed(1) ?? "-"}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {place.favorite_count ?? 0}
            </span>
          </div>
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={onRemove}
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
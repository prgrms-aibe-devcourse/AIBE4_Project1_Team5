// component/planner/SortableItem.tsx 일정편집 페이지 내에서 드래그 가능한 개별 여행지 아이템 UI 컴포넌트

import type { Place } from "@/app/planner/edit/page";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  place: Place;
  onRemove: () => void;
}

export function SortableItem({ place, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: place.place_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-between items-center text-sm p-2 bg-white rounded-md shadow-sm touch-none"
    >
      <span {...listeners} className="flex-grow cursor-grab">
        {place.place_name}
      </span>

      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 ml-2 px-2" // 다른 요소와 구분을 위해 약간의 여백 추가
      >
        🗑️
      </button>
    </div>
  );
}

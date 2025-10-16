import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

// Place 타입 정의 (PlannerEditor에서 export된 것을 사용하거나 여기서 재정의)
interface Place {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
  favorite_count: number;
  review_count?: number;
}

interface SortableItemProps {
  place: Place;
  onRemove: () => void;
  onClick?: () => void;
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
      className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>

        {/* 장소 이미지 */}
        {place.place_image && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={place.place_image}
              alt={place.place_name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* 장소 정보 (클릭 가능) */}
        <button
          onClick={onClick}
          className="flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
            {place.place_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              ⭐ {place.average_rating?.toFixed(1) ?? "-"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1">
              ❤️ {place.favorite_count ?? 0}
            </span>
          </div>
        </button>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

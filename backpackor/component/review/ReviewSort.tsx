// component/review/ReviewSort.tsx
"use client";

// props의 타입을 정의합니다.
interface SortProps {
  currentSort: string;
  onSortChange: (sortValue: string) => void;
}

export default function Sort({ currentSort, onSortChange }: SortProps) {
  return (
    <div className="text-sm text-gray-600 flex items-center gap-2">
      <button
        onClick={() => onSortChange("popularity_desc")}
        className={
          currentSort === "popularity_desc"
            ? "font-bold text-black"
            : "cursor-pointer hover:text-black"
        }
      >
        인기순
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => onSortChange("name_asc")}
        className={
          currentSort === "name_asc"
            ? "font-bold text-black"
            : "cursor-pointer hover:text-black"
        }
      >
      
        이미지 많은 순
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => onSortChange("rating_desc")}
        className={
          currentSort === "rating_desc"
            ? "font-bold text-black"
            : "cursor-pointer hover:text-black"
        }
      >
        별점 높은 순
      </button>
      
      <span className="text-gray-300">|</span>
      <button
        onClick={() => onSortChange("rating_asc")}
        className={
          currentSort === "rating_asc"
            ? "font-bold text-black"
            : "cursor-pointer hover:text-black"
        }
      >
        별점 낮은 순
      </button>
    </div>
  );
}

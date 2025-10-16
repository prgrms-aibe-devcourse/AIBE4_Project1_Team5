"use client";

// props의 타입을 정의합니다.
interface SortProps {
  currentSort: string;
  onSortChange: (sortValue: string) => void;
}

export default function Sort({ currentSort, onSortChange }: SortProps) {
  // 정렬 옵션을 배열 데이터로 관리하여 유지보수성을 높입니다.
  const sortOptions = [
    { value: "popularity_desc", label: "인기순" },
    { value: "reviews_desc", label: "리뷰많은순" },
    { value: "rating_desc", label: "별점높은순" },
  ];

  return (
    <div className="text-sm text-gray-600 flex items-center gap-2">
      {/* 배열을 map으로 순회하여 코드를 간결하게 만듭니다. */}
      {sortOptions.map((option, index) => (
        <div key={option.value} className="flex items-center gap-2">
          <button
            onClick={() => onSortChange(option.value)}
            className={
              currentSort === option.value
                ? "font-bold text-black"
                : "cursor-pointer hover:text-black"
            }
          >
            {option.label}
          </button>
          {/* 마지막 요소 뒤에는 구분자(|)를 추가하지 않습니다. */}
          {index < sortOptions.length - 1 && (
            <span className="text-gray-300">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
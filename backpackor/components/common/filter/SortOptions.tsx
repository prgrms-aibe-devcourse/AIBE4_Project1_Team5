// 공통 정렬 옵션 컴포넌트
"use client";

export interface SortOption {
  value: string;
  label: string;
}

interface SortOptionsProps {
  currentSort: string;
  options: SortOption[];
  onSortChange: (sortValue: string) => void;
  className?: string;
}

export const SortOptions = ({
  currentSort,
  options,
  onSortChange,
  className = "",
}: SortOptionsProps) => {
  return (
    <div className={`text-sm text-gray-600 flex items-center gap-2 ${className}`}>
      {options.map((option, index) => (
        <div key={option.value} className="flex items-center gap-2">
          <button
            onClick={() => onSortChange(option.value)}
            className={
              currentSort === option.value
                ? "font-bold text-black"
                : "cursor-pointer hover:text-black transition-colors"
            }
          >
            {option.label}
          </button>
          {index < options.length - 1 && <span className="text-gray-300">|</span>}
        </div>
      ))}
    </div>
  );
};

// 여행지용 기본 정렬 옵션
export const PLACE_SORT_OPTIONS: SortOption[] = [
  { value: "popularity", label: "인기순" },
  { value: "reviews", label: "리뷰많은순" },
  { value: "rating", label: "별점높은순" },
];

// 리뷰용 기본 정렬 옵션
export const REVIEW_SORT_OPTIONS: SortOption[] = [
  { value: "latest", label: "최신순" },
  { value: "helpful", label: "도움순" },
  { value: "rating_high", label: "별점높은순" },
  { value: "rating_low", label: "별점낮은순" },
];

// 마이페이지 리뷰용 정렬 옵션
export const MY_PAGE_REVIEW_SORT_OPTIONS: SortOption[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "helpful", label: "도움순" },
  { value: "rating_high", label: "별점높은순" },
  { value: "rating_low", label: "별점낮은순" },
];

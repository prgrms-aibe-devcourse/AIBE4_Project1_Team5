// component/review/ReviewSort.tsx
'use client';

interface SortProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function Sort({ currentSort, onSortChange }: SortProps) {
  const sortOptions = [
    { label: '인기순', value: 'popularity_desc' },
    { label: '리뷰많은순', value: 'name_asc' },
    { label: '별점높은순', value: 'rating_desc' },
    { label: '별점낮은순', value: 'rating_asc' },
  ];

  return (
    <div className="flex items-center gap-2">
      {sortOptions.map((option, index) => (
        <div key={option.value} className="flex items-center">
          <button
            onClick={() => onSortChange(option.value)}
            className={`text-sm font-medium transition-colors ${
              currentSort === option.value
                ? 'text-gray-900 font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {option.label}
          </button>
          {index < sortOptions.length - 1 && (
            <span className="mx-2 text-gray-300">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
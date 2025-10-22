// 플래너 제목 및 날짜 입력 컴포넌트
"use client";

interface PlannerTitleInputProps {
  tripTitle: string;
  startDate: string | null;
  endDate: string | null;
  onTitleChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  showDateInputs: boolean;
}

export const PlannerTitleInput = ({
  tripTitle,
  startDate,
  endDate,
  onTitleChange,
  onStartDateChange,
  onEndDateChange,
  showDateInputs,
}: PlannerTitleInputProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-gray-200 shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          여행 제목
        </label>
        <input
          type="text"
          value={tripTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="예: 제주도 힐링 여행"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
        />
      </div>

      {showDateInputs && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-4 w-full">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="pt-6 font-bold text-gray-400">~</span>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                value={endDate || ""}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || ""}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 지도 범례 컴포넌트
"use client";

import { getColorForDay } from "@/utils/mapHelpers";

interface MapLegendProps {
  dayKeys: number[];
}

export const MapLegend = ({ dayKeys }: MapLegendProps) => {
  if (dayKeys.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {dayKeys.map((day, idx) => (
        <div
          key={day}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium"
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getColorForDay(idx) }}
          />
          <span className="text-gray-700">Day {day}</span>
        </div>
      ))}
    </div>
  );
};

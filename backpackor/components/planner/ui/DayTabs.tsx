// Day 탭 컴포넌트
"use client";

import type { DayInfo } from "@/types/planner";

interface DayTabsProps {
  days: DayInfo[];
  activeDay: number;
  onDayChange: (day: number) => void;
}

export const DayTabs = ({ days, activeDay, onDayChange }: DayTabsProps) => {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {days.map((d) => (
        <button
          key={d.day}
          onClick={() => onDayChange(d.day)}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            activeDay === d.day
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          Day {d.day}
        </button>
      ))}
    </div>
  );
};

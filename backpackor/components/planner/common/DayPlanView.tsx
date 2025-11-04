// 공통 컴포넌트: Day 탭 + Day별 장소 리스트
"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// 지도 색상 팔레트
const ROUTE_COLORS = [
  "#2563EB", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
  "#22C55E", // green
  "#06B6D4", // cyan
  "#E11D48", // rose
];

export interface PlaceItem {
  place_id: string;
  place_name: string;
  place_address?: string | null;
  place_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type DayPlan = Record<number, PlaceItem[]>;

interface DayPlanViewProps {
  plan: DayPlan;
  onDayChange?: (day: number) => void;
  onPlaceClick?: (placeId: string) => void;
  initialActiveDay?: number;
}

export default function DayPlanView({
  plan,
  onDayChange,
  onPlaceClick,
  initialActiveDay,
}: DayPlanViewProps) {
  const dayKeys = Object.keys(plan)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  const [activeDay, setActiveDay] = useState<number>(
    initialActiveDay || dayKeys[0] || 1
  );
  const dayRefsRef = useRef<Record<number, HTMLElement | null>>({});

  const pickDayColor = (day: number) =>
    ROUTE_COLORS[(day - 1) % ROUTE_COLORS.length];

  const handleDayChange = (day: number) => {
    setActiveDay(day);
    if (onDayChange) {
      onDayChange(day);
    }

    // 해당 Day 섹션으로 스크롤
    const dayElement = dayRefsRef.current[day];
    if (dayElement) {
      const headerOffset = 200; // sticky 헤더 높이 + 여유 공간
      const elementPosition = dayElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handlePlaceClick = (placeId: string) => {
    if (onPlaceClick) {
      onPlaceClick(placeId);
    }
  };

  return (
    <>
      {/* Sticky 헤더: Day 탭 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6 z-10 mb-4">
        <div className="flex gap-2 flex-wrap">
          {dayKeys.map((day, idx) => {
            const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
            return (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                style={{
                  backgroundColor: activeDay === day ? color : "white",
                  color: activeDay === day ? "white" : "#374151",
                  border:
                    activeDay === day
                      ? `2px solid ${color}`
                      : "2px solid #E5E7EB",
                  boxShadow:
                    activeDay === day ? "0 0 6px rgba(0,0,0,0.15)" : "none",
                }}
                className="px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                Day {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day별 장소 리스트 */}
      <div className="space-y-6">
        {dayKeys.map((day) => {
          const places = plan[day] || [];
          const color = pickDayColor(day);

          return (
            <div
              key={day}
              ref={(el) => {
                dayRefsRef.current[day] = el;
              }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color }}>
                Day {day}
              </h3>

              <div className="space-y-3">
                {places.length > 0 ? (
                  places.map((place, idx) => (
                    <div
                      key={place.place_id}
                      onClick={() => handlePlaceClick(place.place_id)}
                      className="relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all overflow-hidden cursor-pointer hover:shadow-md"
                    >
                      {/* 왼쪽 색상 바 */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: color }}
                      />

                      <div
                        className="w-10 h-10 flex items-center justify-center text-white rounded-full font-bold text-base shadow-sm flex-shrink-0 ml-2"
                        style={{ backgroundColor: color }}
                      >
                        {idx + 1}
                      </div>

                      {place.place_image && (
                        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                          <Image
                            src={place.place_image}
                            alt={place.place_name}
                            fill
                            sizes="96px"
                            className="rounded-lg object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 mb-1 truncate">
                          {place.place_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                          {place.place_address && (
                            <span className="truncate">{place.place_address}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="text-base font-medium">
                      이 날짜에는 장소가 없어요
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

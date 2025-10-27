"use client";

import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { TripPlan, TripPlanDetail, GroupedDetails, TripDetailClientProps } from "@/types";
import { differenceInCalendarDays, isAfter } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function TripDetailClient({
  plan,
  groupedDetails,
  onDayChange,
}: TripDetailClientProps) {
  const supabase = createBrowserClient();
  const router = useRouter();

  // 모달 상태
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // 활성 Day 상태
  const dayKeys = Object.keys(groupedDetails)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);
  const [activeDay, setActiveDay] = useState<number>(dayKeys[0] || 1);
  const dayRefsRef = useRef<Record<number, HTMLElement | null>>({});

  // 여행 종료 여부 체크 - plan에서 받은 날짜 사용
  const isTripFinished = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 정보 제거하고 날짜만 비교

    const endDate = new Date(plan.trip_end_date);
    endDate.setHours(0, 0, 0, 0);

    return isAfter(today, endDate);
  };

  const showReview = isTripFinished();

  // 여행 기간 계산 (박수/일수)
  const getTripDuration = () => {
    const nights = differenceInCalendarDays(
      new Date(plan.trip_end_date),
      new Date(plan.trip_start_date)
    );
    const days = nights + 1;
    return { nights, days };
  };

  const { nights, days } = getTripDuration();

  // 카카오맵과 동일 팔레트
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

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const pickDayColor = (day: number) =>
    ROUTE_COLORS[(day - 1) % ROUTE_COLORS.length];

  const handleDelete = async () => {
    const isConfirmed = confirm("정말 이 일정을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await supabase
        .from("trip_plan_detail")
        .delete()
        .eq("trip_id", plan.trip_id);
      await supabase.from("trip_plan").delete().eq("trip_id", plan.trip_id);
      alert("삭제되었습니다.");
      router.push("/my-planner");
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // 장소 클릭 핸들러 (모달 열기)
  const handlePlaceClick = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedPlaceId(null);
  };

  // Day 변경 핸들러
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
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <header className="mb-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href="/my-planner"
              className="text-blue-500 hover:underline mb-2 inline-block text-sm"
            >
              &larr; 내 일정 목록으로 돌아가기
            </Link>
            <h1 className="text-lg font-bold truncate">{plan.trip_title}</h1>
            <p className="text-sm text-gray-900 mt-1">
              {plan.trip_start_date} ~ {plan.trip_end_date}{" "}
              <span className="text-gray-600 font-medium">
                ({nights}박 {days}일)
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              href={`/planner/edit?trip_id=${plan.trip_id}&start=${plan.trip_start_date}&end=${plan.trip_end_date}`}
              className="px-4 py-2 text-center bg-gray-200 font-semibold rounded-lg text-sm hover:bg-gray-300 whitespace-nowrap"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-sm hover:bg-red-200 whitespace-nowrap"
            >
              삭제
            </button>
          </div>
        </div>
      </header>

      {/* Sticky 헤더: Day 탭 */}
      <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm sticky top-6 z-10 mb-4">
        {/* Day 탭 버튼 */}
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

      {/* Day별 일정 카드 */}
      <main className="space-y-4">
        {Object.keys(groupedDetails).length > 0 ? (
          Object.keys(groupedDetails).map((dayKey) => {
            const day = Number(dayKey);
            const color = pickDayColor(day);

            return (
              <section
                key={day}
                ref={(el) => {
                  dayRefsRef.current[day] = el;
                }}
                className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm"
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color }}>
                  Day {day}
                </h2>

                <div className="space-y-2">
                  {groupedDetails[day].map((detail, idx) => (
                    <button
                      key={`${detail.day_number}-${detail.place.place_id}-${idx}`}
                      onClick={() => handlePlaceClick(detail.place.place_id)}
                      className="relative w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer overflow-hidden"
                    >
                      {/* 왼쪽 색상 바 */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: color }}
                      />

                      <div className="flex items-center gap-3 pl-2">
                        {/* 순서 번호 동그라미 */}
                        <div
                          className="w-10 h-10 flex items-center justify-center text-white rounded-full font-bold text-base shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {idx + 1}
                        </div>

                        {/* 장소 이미지 */}
                        {detail.place.place_image && (
                          <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 overflow-hidden rounded-lg">
                            <Image
                              src={detail.place.place_image}
                              alt={detail.place.place_name}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="56px"
                              priority={false}
                              quality={75}
                              unoptimized={detail.place.place_image.includes("picsum.photos")}
                              className="rounded-lg"
                              onError={() =>
                                console.error(
                                  "이미지 로드 실패:",
                                  detail.place.place_image
                                )
                              }
                            />
                          </div>
                        )}

                        {/* 장소 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {detail.place.place_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {detail.place.place_address}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="text-gray-500">아직 등록된 상세 일정이 없습니다.</p>
        )}
      </main>

      {/* 모달 - 여행 종료 시에만 리뷰 버튼 표시 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={handleCloseModal}
          showReviewButton={showReview}
        />
      )}
    </div>
  );
}

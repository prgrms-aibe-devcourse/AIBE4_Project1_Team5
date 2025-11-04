"use client";

import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import DayPlanView, { type DayPlan } from "@/components/planner/common/DayPlanView";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { TripPlan, TripPlanDetail, GroupedDetails, TripDetailClientProps } from "@/types";
import { differenceInCalendarDays, isAfter } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TripDetailClient({
  plan,
  groupedDetails,
  onDayChange,
}: TripDetailClientProps) {
  const router = useRouter();

  // 모달 상태
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

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

  const handleDelete = async () => {
    const isConfirmed = confirm("정말 이 일정을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const supabase = createBrowserClient();
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

  // DayPlanView에서 사용할 데이터 변환
  const dayPlan: DayPlan = Object.fromEntries(
    Object.entries(groupedDetails).map(([day, details]) => [
      Number(day),
      details.map((d) => ({
        place_id: d.place.place_id,
        place_name: d.place.place_name,
        place_address: d.place.place_address,
        place_image: d.place.place_image,
        latitude: d.place.latitude,
        longitude: d.place.longitude,
      })),
    ])
  );

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

      {/* Day 탭 + Day별 일정 카드 */}
      <DayPlanView
        plan={dayPlan}
        onDayChange={onDayChange}
        onPlaceClick={setSelectedPlaceId}
      />

      {/* 모달 - 여행 종료 시에만 리뷰 버튼 표시 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
          showReviewButton={showReview}
        />
      )}
    </div>
  );
}

"use client";

import PlaceDetailModal from "@/components/place/PlaceDetailModal";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";
import { isAfter } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
}

interface TripPlanDetail {
  day_number: number;
  visit_order: number | string | null;
  place: Place;
}
type GroupedDetails = Record<number, TripPlanDetail[]>;

interface TripDetailClientProps {
  plan: TripPlan;
  groupedDetails: GroupedDetails;
}

export default function TripDetailClient({
  plan,
  groupedDetails,
}: TripDetailClientProps) {
  const supabase = createBrowserClient();
  const router = useRouter();

  // 모달 상태
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // 🔍 디버깅: plan 데이터 확인
  console.log("📅 Plan 데이터:", plan);
  console.log("📅 trip_end_date:", plan.trip_end_date);

  // 여행 종료 여부 체크 - plan에서 받은 날짜 사용
  const isTripFinished = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 정보 제거하고 날짜만 비교

    const endDate = new Date(plan.trip_end_date);
    endDate.setHours(0, 0, 0, 0);

    console.log("🔍 여행 종료 체크:");
    console.log("  오늘:", today.toISOString());
    console.log("  종료일:", endDate.toISOString());
    console.log("  여행 종료?", isAfter(today, endDate));

    return isAfter(today, endDate);
  };

  const showReview = isTripFinished();
  console.log("✅ showReviewButton:", showReview);

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
      console.error("삭제 오류:", err);
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Link
              href="/my-planner"
              className="text-blue-500 hover:underline mb-2 inline-block"
            >
              &larr; 내 일정 목록으로 돌아가기
            </Link>
            <h1 className="text-4xl font-bold">{plan.trip_title}</h1>
            <p className="text-lg text-gray-500">
              {plan.trip_start_date} ~ {plan.trip_end_date}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/planner/edit?trip_id=${plan.trip_id}&start=${plan.trip_start_date}&end=${plan.trip_end_date}`}
              className="px-4 py-2 text-center bg-gray-200 font-semibold rounded-lg text-sm hover:bg-gray-300"
            >
              수정하기
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-sm hover:bg-red-200"
            >
              삭제하기
            </button>
          </div>
        </div>
      </header>

      {/* Day별 일정 카드 */}
      <main className="space-y-8">
        {Object.keys(groupedDetails).length > 0 ? (
          Object.keys(groupedDetails).map((dayKey) => {
            const day = Number(dayKey);
            const color = pickDayColor(day);
            const softBorder = hexToRgba(color, 0.35);

            return (
              <section key={day} className="space-y-4">
                <h2 className="text-2xl font-semibold mb-1" style={{ color }}>
                  Day {day}
                </h2>

                <div className="space-y-4">
                  {groupedDetails[day].map((detail, idx) => (
                    <button
                      key={`${detail.day_number}-${detail.place.place_id}-${idx}`}
                      onClick={() => handlePlaceClick(detail.place.place_id)}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer text-left"
                      style={{
                        borderLeft: `6px solid ${color}`,
                        boxShadow: `0 1px 0 0 ${softBorder}`,
                      }}
                    >
                      <img
                        src={detail.place.place_image ?? "/default-image.jpg"}
                        alt={detail.place.place_name}
                        className="w-20 h-20 object-cover rounded-md"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">
                          {detail.place.place_name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {detail.place.place_address}
                        </p>
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

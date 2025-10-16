"use client";

import { createBrowserClient } from "@/lib/supabaseClient";
import type { Place } from "@/type/place";
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
  visit_order: number;
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

  // 리뷰 작성 관련 상태
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

  const handleDelete = async () => {
    const isConfirmed = confirm(
      "정말 이 일정을 삭제하시겠습니까? 되돌릴 수 없습니다."
    );
    if (!isConfirmed) return;

    try {
      // 1. 상세 일정 먼저 삭제
      await supabase
        .from("trip_plan_detail")
        .delete()
        .eq("trip_id", plan.trip_id);
      // 2. 메인 일정 삭제
      await supabase.from("trip_plan").delete().eq("trip_id", plan.trip_id);

      alert("일정이 삭제되었습니다.");
      router.push("/my-page"); // 삭제 후 목록 페이지로 이동
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  // 여행 날짜가 지났는지 확인
  const isTripFinished = () => {
    const today = new Date();
    const endDate = new Date(plan.trip_end_date);
    return endDate < today;
  };

  // 리뷰 작성 버튼 클릭 핸들러
  const handleReviewClick = () => {
    if (!isTripFinished()) {
      alert("아직 여행 날짜가 지나지 않았습니다.");
      return;
    }
    setShowReviewForm(true);
  };

  // 여행지 선택 핸들러
  const handlePlaceSelect = (place: Place, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPlaces((prev) => [...prev, place]);
    } else {
      setSelectedPlaces((prev) =>
        prev.filter((p) => p.place_id !== place.place_id)
      );
    }
  };

  // 리뷰 작성 폼으로 이동
  const handleReviewSubmit = () => {
    if (selectedPlaces.length === 0) {
      alert("리뷰를 작성할 여행지를 선택해주세요.");
      return;
    }

    // 선택된 여행지 정보를 쿼리 파라미터로 전달
    const placeIds = selectedPlaces.map((p) => p.place_id).join(",");
    const placeNames = selectedPlaces.map((p) => p.place_name).join(",");

    router.push(
      `/review/write-trip?placeIds=${encodeURIComponent(
        placeIds
      )}&placeNames=${encodeURIComponent(
        placeNames
      )}&tripTitle=${encodeURIComponent(plan.trip_title)}`
    );
  };

  // 모든 여행지 리스트 (중복 제거)
  const allPlaces = Array.from(
    new Map(
      Object.values(groupedDetails)
        .flat()
        .map((detail) => [detail.place.place_id, detail.place])
    ).values()
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
          {/* 버튼 묶음 */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/planner/edit?trip_id=${plan.trip_id}&start=${plan.trip_start_date}&end=${plan.trip_end_date}`}
              className="px-4 py-2 text-center bg-gray-200 font-semibold rounded-lg text-sm hover:bg-gray-300"
            >
              수정하기 ✏️
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-sm hover:bg-red-200"
            >
              삭제하기 🗑️
            </button>
            <button
              onClick={handleReviewClick}
              className="px-4 py-2 bg-green-100 text-green-600 font-semibold rounded-lg text-sm hover:bg-green-200"
            >
              리뷰 작성 ✍️
            </button>
          </div>
        </div>
      </header>

      {/* 리뷰 작성 여행지 선택 폼 */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">
            리뷰를 작성할 여행지를 선택하세요
          </h3>
          <div className="space-y-3 mb-4">
            {allPlaces.map((place) => (
              <label
                key={place.place_id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  onChange={(e) => handlePlaceSelect(place, e.target.checked)}
                />
                <img
                  src={place.place_image ?? "/default-image.jpg"} // ✅ null-safe 처리
                  alt={place.place_name}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <span className="font-medium">{place.place_name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReviewSubmit}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              선택한 여행지 리뷰 작성
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
          </div>
          {selectedPlaces.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              선택된 여행지: {selectedPlaces.length}개
            </p>
          )}
        </div>
      )}

      {/* 일정 상세 */}
      <main className="space-y-6">
        {Object.keys(groupedDetails).length > 0 ? (
          Object.keys(groupedDetails).map((day) => (
            <div key={day}>
              <h2 className="text-2xl font-semibold mb-3">Day {day}</h2>
              <div className="space-y-4">
                {groupedDetails[Number(day)].map((detail) => (
                  <div
                    key={`${detail.day_number}-${detail.place.place_id}`}
                    className="flex items-center gap-4 p-3 bg-white rounded-lg shadow"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white font-bold rounded-full flex items-center justify-center">
                      {detail.visit_order}
                    </span>
                    <img
                      src={detail.place.place_image ?? "/default-image.jpg"}
                      alt={detail.place.place_name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <h3 className="font-semibold">{detail.place.place_name}</h3>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">아직 등록된 상세 일정이 없습니다.</p>
        )}
      </main>
    </div>
  );
}

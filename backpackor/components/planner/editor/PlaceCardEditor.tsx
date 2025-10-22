"use client";

import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export interface Place {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
  favorite_count: number;
}

type Plan = Record<number, Place[]>;

type PlannerEditorProps = {
  initialPlaces: Place[];
};

export default function PlannerEditor({ initialPlaces }: PlannerEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tripIdToEdit = searchParams.get("trip_id");
  const startDateStr = searchParams.get("start");
  const endDateStr = searchParams.get("end");

  const [tripTitle, setTripTitle] = useState("");
  const [plan, setPlan] = useState<Plan>({ 1: [] });
  const [currentDay, setCurrentDay] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 날짜 파싱 및 (n박 n+1일) 계산
  const startDate = startDateStr ? parseISO(startDateStr) : null;
  const endDate = endDateStr ? parseISO(endDateStr) : null;
  const nights =
    startDate && endDate && isValid(startDate) && isValid(endDate)
      ? differenceInCalendarDays(endDate, startDate)
      : null;
  const days = nights !== null ? nights + 1 : null;
  const formatKR = (d: Date | null) =>
    d && isValid(d) ? format(d, "M월 d일", { locale: ko }) : null;

  // 검색 필터링
  const filteredPlaces = (initialPlaces || []).filter((place) =>
    place.place_name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // 장소 추가
  const handleAddPlace = (place: Place) => {
    const isDuplicate = plan[currentDay]?.some(
      (p) => p.place_id === place.place_id
    );
    if (isDuplicate) {
      alert("이미 추가된 장소입니다.");
      return;
    }
    setPlan((prev) => ({
      ...prev,
      [currentDay]: [...(prev[currentDay] || []), place],
    }));
  };

  // 장소 제거
  const handleRemovePlace = (placeId: string) => {
    setPlan((prev) => ({
      ...prev,
      [currentDay]: (prev[currentDay] || []).filter(
        (p) => p.place_id !== placeId
      ),
    }));
  };

  // 장소 순서 변경
  const handleReorderPlace = (fromIndex: number, toIndex: number) => {
    const dayPlaces = [...(plan[currentDay] || [])];
    const [movedPlace] = dayPlaces.splice(fromIndex, 1);
    dayPlaces.splice(toIndex, 0, movedPlace);
    setPlan((prev) => ({
      ...prev,
      [currentDay]: dayPlaces,
    }));
  };

  // Day 추가/삭제
  const handleAddDay = () => {
    const newDay = Math.max(...Object.keys(plan).map(Number)) + 1;
    setPlan((prev) => ({ ...prev, [newDay]: [] }));
    setCurrentDay(newDay);
  };

  const handleRemoveDay = (day: number) => {
    if (Object.keys(plan).length <= 1) {
      alert("최소 1일은 필요합니다.");
      return;
    }
    const newPlan = { ...plan };
    delete newPlan[day];
    setPlan(newPlan);
    const remainingDays = Object.keys(newPlan)
      .map(Number)
      .sort((a, b) => a - b);
    setCurrentDay(remainingDays[0]);
  };

  // 미리보기로 이동
  const handlePreviewPlan = () => {
    if (!tripTitle.trim()) {
      alert("여행 제목을 입력해주세요.");
      return;
    }
    const hasPlaces = Object.values(plan).some((places) => places.length > 0);
    if (!hasPlaces) {
      alert("최소 1개 이상의 장소를 추가해주세요.");
      return;
    }
    const draft = {
      tripIdToEdit: tripIdToEdit ?? null,
      tripTitle,
      startDateStr,
      endDateStr,
      plan,
    };
    try {
      sessionStorage.setItem("planner_draft", JSON.stringify(draft));
      router.push("/planner/preview");
    } catch (e) {
      console.error("미리보기 데이터 저장 실패:", e);
      alert("미리보기 데이터를 저장하는 중 오류가 발생했습니다.");
    }
  };

  const dayKeys = Object.keys(plan)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            여행 일정 만들기
          </h1>
          <p className="text-gray-600">
            원하는 장소를 추가하고 나만의 여행 일정을 계획해보세요
          </p>
        </div>

        {/* 여행 제목 & 날짜 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              여행 제목
            </label>
            <input
              type="text"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              placeholder="예: 제주도 힐링 여행"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {startDateStr && endDateStr && (
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5"
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
              <span className="font-medium">
                {formatKR(startDate) ?? startDateStr}
              </span>
              <span className="text-gray-400">-</span>
              <span className="font-medium">
                {formatKR(endDate) ?? endDateStr}
              </span>
              {nights !== null && nights >= 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({nights}박 {days}일)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측: Day 탭 + 장소 선택 */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              {/* Day 탭 (좌측으로 이동) */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  일자 선택
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {dayKeys.map((day) => (
                    <div key={day} className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentDay(day)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                          currentDay === day
                            ? "bg-blue-500 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Day {day}
                      </button>
                      {dayKeys.length > 1 && (
                        <button
                          onClick={() => handleRemoveDay(day)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Day 삭제"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddDay}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Day 추가
                  </button>
                </div>
              </div>

              {/* 여행지 리스트 */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  여행지 둘러보기
                </h2>

                {/* 검색 */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="장소명 검색"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* 장소 목록 */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map((place) => (
                      <button
                        key={place.place_id}
                        onClick={() => handleAddPlace(place)}
                        className="w-full p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {place.place_image && (
                            <div className="relative w-14 h-14 flex-shrink-0">
                              <Image
                                src={place.place_image}
                                alt={place.place_name}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {place.place_name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5 text-yellow-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {place.average_rating?.toFixed(1) ?? "-"}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {place.favorite_count ?? 0}
                              </span>
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p>검색 결과가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 일정 편집 (타임라인 카드 리디자인) */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border text-blue-600 font-bold shadow-sm">
                    D{currentDay}
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      일정 (Day {currentDay})
                    </h2>
                    <p className="text-xs text-gray-500">
                      위·아래 화살표로 순서를 조정하세요.
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-700 bg-white px-3 py-1.5 rounded-full border">
                  총 {plan[currentDay]?.length || 0}개
                </span>
              </div>

              <div className="p-6">
                {plan[currentDay] && plan[currentDay].length > 0 ? (
                  <ol className="relative border-l-2 border-gray-200 pl-5 space-y-4">
                    {plan[currentDay].map((place, index) => (
                      <li key={place.place_id} className="relative group">
                        {/* 순번 점 */}
                        <span className="absolute -left-[13px] top-4 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold ring-4 ring-white shadow">
                          {index + 1}
                        </span>

                        {/* 카드 */}
                        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all">
                          {/* 이미지 + 정보 */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {place.place_image && (
                              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image
                                  src={place.place_image}
                                  alt={place.place_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {place.place_name}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {place.average_rating?.toFixed(1) ?? "-"}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {place.favorite_count ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <button
                              onClick={() =>
                                index > 0 &&
                                handleReorderPlace(index, index - 1)
                              }
                              disabled={index === 0}
                              title="위로"
                              aria-label="위로"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border bg-white text-gray-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() =>
                                index < plan[currentDay].length - 1 &&
                                handleReorderPlace(index, index + 1)
                              }
                              disabled={index === plan[currentDay].length - 1}
                              title="아래로"
                              aria-label="아래로"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border bg-white text-gray-500 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleRemovePlace(place.place_id)}
                              title="삭제"
                              aria-label="삭제"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border bg-white text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
                                <path
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">
                      아직 선택한 장소가 없어요
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      왼쪽 목록에서 장소를 클릭해 추가해 보세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-end gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
          >
            취소
          </button>
          <button
            onClick={handlePreviewPlan}
            className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            일정 미리보기
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

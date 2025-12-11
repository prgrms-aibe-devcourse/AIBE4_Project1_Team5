"use client";

import { differenceInDays, format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function AiPlannerDatePage() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const handleNextClick = () => {
    if (!selectedRange || !selectedRange.from || !selectedRange.to) {
      alert("여행 시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    // AI 일정 생성 가능 날짜 제한 (최대 5일)
    // 빡빡한 일정 기준 (하루 8개 × 5일 = 40개)을 고려하여 제한
    const nights = differenceInDays(selectedRange.to, selectedRange.from);
    const days = nights + 1;
    const MAX_DAYS = 5;

    if (days > MAX_DAYS) {
      alert(
        "AI 일정 생성은 4박 5일 이내로 선택해주세요.\n\n" +
        "5박 6일 이상의 긴 일정은 직접 생성해주세요."
      );
      return;
    }

    const startDate = format(selectedRange.from, "yyyy-MM-dd");
    const endDate = format(selectedRange.to, "yyyy-MM-dd");

    router.push(`/planner/ai/region?start=${startDate}&end=${endDate}`);
  };

  const getNightsAndDays = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const nights = differenceInDays(selectedRange.to, selectedRange.from);
      const days = nights + 1;
      return { nights, days };
    }
    return null;
  };

  const tripInfo = getNightsAndDays();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">뒤로가기</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI 여행 날짜 선택
          </h1>
          <p className="text-lg text-gray-600">
            AI 추천을 위해 출발일과 도착일을 선택해주세요.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 좌측: 날짜 정보 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 출발일 카드 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-2">출발일</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {selectedRange?.from
                  ? format(selectedRange.from, "M월 d일 (E)", { locale: ko })
                  : "날짜 선택"}
              </p>
              {selectedRange?.from && (
                <p className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  {format(selectedRange.from, "yyyy년 M월 d일", { locale: ko })}
                </p>
              )}
            </div>

            {/* 화살표 */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

            {/* 도착일 카드 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-2">도착일</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {selectedRange?.to
                  ? format(selectedRange.to, "M월 d일 (E)", { locale: ko })
                  : "날짜 선택"}
              </p>
              {selectedRange?.to && (
                <p className="text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                  {format(selectedRange.to, "yyyy년 M월 d일", { locale: ko })}
                </p>
              )}
            </div>

            {/* 여행 기간 요약 */}
            {tripInfo ? (
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">
                      총 여행 기간
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      {tripInfo.nights}박 {tripInfo.days}일
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-9 h-9 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-6 text-center border-2 border-dashed border-gray-300">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-400"
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
                <p className="text-gray-500 font-medium">오른쪽 달력에서</p>
                <p className="text-gray-500">AI 여행 날짜를 선택해주세요</p>
              </div>
            )}
          </div>

          {/* 우측: 캘린더 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <style jsx global>{`
                .custom-calendar {
                  padding: 2rem;
                }
                .custom-calendar .rdp {
                  --rdp-cell-size: 56px;
                  --rdp-accent-color: #3b82f6;
                  --rdp-background-color: #dbeafe;
                  margin: 0;
                }
                .custom-calendar .rdp-months {
                  justify-content: center;
                }
                .custom-calendar .rdp-caption_label {
                  color: #111827;
                  font-weight: 700;
                  font-size: 1.125rem;
                  text-align: center;
                }
                .custom-calendar .rdp-day {
                  border-radius: 12px;
                  font-weight: 500;
                  font-size: 0.95rem;
                }
                .custom-calendar .rdp-day_selected {
                  background: linear-gradient(
                    135deg,
                    #3b82f6 0%,
                    #2563eb 100%
                  ) !important;
                  color: white !important;
                  font-weight: 700;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                .custom-calendar .rdp-day_range_middle {
                  background-color: #dbeafe !important;
                  color: #1e40af !important;
                }
                .custom-calendar .rdp-day_today:not(.rdp-day_selected) {
                  color: #3b82f6;
                  background-color: #eff6ff;
                  font-weight: 700;
                }
              `}</style>

              <div className="custom-calendar">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  locale={ko}
                  disabled={{ before: new Date() }}
                  numberOfMonths={1}
                  formatters={{
                    formatCaption: (date) =>
                      format(date, "yyyy년 M월", { locale: ko }),
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 mt-8">
          <Link
            href="/planner"
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            취소
          </Link>
          <button
            onClick={handleNextClick}
            disabled={!selectedRange?.from || !selectedRange?.to}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            다음 단계로
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
    </div>
  );
}

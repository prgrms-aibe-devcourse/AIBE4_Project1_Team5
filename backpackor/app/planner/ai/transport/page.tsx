// app/planner/ai/transport/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * AI 여행 계획 생성을 위한 이동수단 선택 페이지 컴포넌트입니다. (마지막 단계)
 */
function AiPlannerTransportContent() {
  const searchParams = useSearchParams();
  const [selectedTransport, setSelectedTransport] = useState<string[]>([]);

  // 다중 파라미터들을 배열로 받아옵니다.
  const regions = searchParams.getAll("region");
  const regionIds = searchParams.getAll("region_id");
  const styles = searchParams.getAll("style");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const companion = searchParams.get("companion");
  const speed = searchParams.get("speed");

  const transportOptions = [
    { name: "자동차", value: "car", icon: "🚗", desc: "편안한 이동" },
    { name: "자전거", value: "bicycle", icon: "🚴", desc: "여유로운 라이딩" },
    { name: "도보", value: "walk", icon: "🚶", desc: "천천히 걸으며" },
    {
      name: "대중교통",
      value: "public_transport",
      icon: "🚌",
      desc: "버스/지하철",
    },
    { name: "기차", value: "train", icon: "🚄", desc: "빠른 이동" },
  ];

  const handleTransportClick = (transportValue: string) => {
    setSelectedTransport((prev) =>
      prev.includes(transportValue)
        ? prev.filter((s) => s !== transportValue)
        : [...prev, transportValue]
    );
  };

  /**
   * @param isNext '다음 단계'로 갈 것인지 여부
   */
  const createUrl = (isNext: boolean) => {
    const params = new URLSearchParams();

    // 이전 단계들에서 받아온 모든 파라미터들을 추가합니다.
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (companion) params.append("companion", companion);
    if (speed) params.append("speed", speed);
    regions.forEach((region) => params.append("region", region));
    regionIds.forEach((id) => params.append("region_id", id));
    styles.forEach((style) => params.append("style", style));

    if (isNext) {
      // '다음 단계'일 경우, 현재 페이지에서 선택한 이동수단 정보를 추가합니다.
      selectedTransport.forEach((transport) =>
        params.append("transport", transport)
      );
      return `/planner/ai/loading?${params.toString()}`;
    } else {
      // '이전 단계'일 경우, 속도 선택 페이지로 돌아갑니다.
      return `/planner/ai/speed?${params.toString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              5
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-3 text-sm tracking-wider uppercase">
            Step 5 of 5 - 마지막 단계!
          </p>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            어떤 이동수단을 이용하실 건가요?
          </h1>
          <p className="text-gray-500 text-lg">
            주요 이동수단을 모두 선택해주세요 (복수 선택 가능)
          </p>
        </div>

        {/* 이동수단 옵션 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {transportOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTransportClick(option.value)}
              className={`group relative p-6 bg-white rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                selectedTransport.includes(option.value)
                  ? "border-blue-500 shadow-lg ring-4 ring-blue-100"
                  : "border-gray-200 hover:border-blue-300 shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`text-5xl transition-transform duration-200 ${
                    selectedTransport.includes(option.value)
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-base mb-1">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </div>
              </div>
              {selectedTransport.includes(option.value) && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 선택된 이동수단 카운터 */}
        {selectedTransport.length > 0 && (
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {selectedTransport.length}개 선택됨
            </span>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center gap-4">
          <Link
            href={createUrl(false)}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            이전 단계
          </Link>
          <Link
            href={selectedTransport.length > 0 ? createUrl(true) : "#"}
            className={`group flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all text-lg ${
              selectedTransport.length > 0
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (selectedTransport.length === 0) e.preventDefault();
            }}
          >
            AI 추천 받기
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AiPlannerTransportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AiPlannerTransportContent />
    </Suspense>
  );
}

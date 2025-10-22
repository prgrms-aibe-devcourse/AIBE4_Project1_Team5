// app/planner/ai/speed/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * AI 여행 계획 생성을 위한 여행 속도 선택 페이지 컴포넌트
 */
export default function AiPlannerSpeedPage() {
  const searchParams = useSearchParams();
  const [selectedSpeed, setSelectedSpeed] = useState<string>("normal");

  // 다중 지역 및 스타일 정보를 배열로 받아옵니다.
  const regions = searchParams.getAll("region");
  const regionIds = searchParams.getAll("region_id");
  const styles = searchParams.getAll("style");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const companion = searchParams.get("companion");

  const speedOptions = [
    {
      name: "느긋한 일정",
      value: "relaxed",
      description: "하루 평균 1~2개의 활동을 추천합니다.",
      icon: "🐢",
      color: "emerald",
    },
    {
      name: "보통",
      value: "normal",
      description: "하루 평균 3~4개의 활동을 추천합니다.",
      icon: "🚶",
      color: "blue",
    },
    {
      name: "꽉 찬 일정",
      value: "packed",
      description: "하루 평균 5개 이상의 활동을 추천합니다.",
      icon: "🏃",
      color: "orange",
    },
  ];

  const selectedOption = speedOptions.find(
    (opt) => opt.value === selectedSpeed
  );

  /**
   * @param isNext '다음 단계'로 갈 것인지 여부
   */
  const createUrl = (isNext: boolean) => {
    const params = new URLSearchParams();

    // 이전 단계들에서 받아온 모든 파라미터들을 추가합니다.
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (companion) params.append("companion", companion);
    regions.forEach((region) => params.append("region", region)); // 모든 지역 추가
    regionIds.forEach((id) => params.append("region_id", id));
    styles.forEach((style) => params.append("style", style)); // 모든 스타일 추가

    if (isNext) {
      // '다음 단계'일 경우, 현재 페이지에서 선택한 속도 정보를 추가합니다.
      params.append("speed", selectedSpeed);
      return `/planner/ai/transport?${params.toString()}`;
    } else {
      // '이전 단계'일 경우, 스타일 선택 페이지로 돌아갑니다.
      return `/planner/ai/style?${params.toString()}`;
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
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
              5
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold mb-3 text-sm tracking-wider uppercase">
            Step 4 of 5
          </p>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            어떤 속도의 여행을 선호하시나요?
          </h1>
          <p className="text-gray-500 text-lg">
            여행 스타일에 맞는 일정 강도를 선택해주세요
          </p>
        </div>

        {/* 속도 옵션 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedSpeed(option.value)}
              className={`group relative p-8 bg-white rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                selectedSpeed === option.value
                  ? "border-blue-500 shadow-xl ring-4 ring-blue-100"
                  : "border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`text-6xl transition-transform duration-200 ${
                    selectedSpeed === option.value
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-xl mb-2">
                    {option.name}
                  </div>
                  <div className="text-sm text-gray-500 leading-relaxed">
                    {option.description}
                  </div>
                </div>
              </div>
              {selectedSpeed === option.value && (
                <div className="absolute top-4 right-4">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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

        {/* 선택된 옵션 요약 */}
        <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 mb-12 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{selectedOption?.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">선택된 여행 속도</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedOption?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {selectedOption?.description}
              </p>
            </div>
          </div>
        </div>

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
            href={createUrl(true)}
            className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all"
          >
            다음 단계
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

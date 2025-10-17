// app/planner/ai/companion/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * AI 여행 계획 생성을 위한 동행 선택 페이지 컴포넌트
 */
export default function AiPlannerCompanionPage() {
  const searchParams = useSearchParams();
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(
    null
  );

  // .get('region') 대신 .getAll('region')을 사용하여 모든 지역 정보를 배열로 가져옵니다.
  const regions = searchParams.getAll("region");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const companionOptions = [
    { name: "혼자", value: "alone", icon: "🧳", desc: "나만의 시간" },
    { name: "친구와", value: "friends", icon: "👥", desc: "즐거운 추억" },
    { name: "부모님과", value: "family", icon: "👨‍👩‍👦", desc: "효도 여행" },
    { name: "아이와", value: "kids", icon: "👶", desc: "가족 나들이" },
    { name: "연인과", value: "couple", icon: "💑", desc: "로맨틱한 여행" },
  ];

  /**
   * @param isNext '다음 단계'로 갈 것인지 여부
   */
  const createUrl = (isNext: boolean) => {
    const params = new URLSearchParams();

    // 기본 파라미터 (날짜, 지역)를 먼저 추가합니다.
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    // regions 배열을 순회하며 모든 지역 정보를 같은 이름('region')으로 파라미터에 추가합니다.
    regions.forEach((region) => params.append("region", region));

    if (isNext) {
      // '다음 단계'일 경우, 현재 페이지에서 선택한 동행 정보를 추가합니다.
      if (selectedCompanion) params.append("companion", selectedCompanion);
      return `/planner/ai/style?${params.toString()}`;
    } else {
      // '이전 단계'일 경우, 지역 선택 페이지로 돌아갑니다.
      return `/planner/ai/region?${params.toString()}`;
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
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
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
            Step 2 of 5
          </p>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            누구와 함께 여행을 떠나시나요?
          </h1>
          <p className="text-gray-500 text-lg">
            동행자를 선택하면 맞춤형 일정을 추천해드려요
          </p>
        </div>

        {/* 동행 옵션 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {companionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCompanion(option.value)}
              className={`group relative p-6 bg-white rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                selectedCompanion === option.value
                  ? "border-blue-500 shadow-lg ring-4 ring-blue-100"
                  : "border-gray-200 hover:border-blue-300 shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`text-5xl transition-transform duration-200 ${
                    selectedCompanion === option.value
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg mb-1">
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </div>
              </div>
              {selectedCompanion === option.value && (
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
            href={selectedCompanion ? createUrl(true) : "#"}
            className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all ${
              selectedCompanion
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!selectedCompanion) e.preventDefault();
            }}
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

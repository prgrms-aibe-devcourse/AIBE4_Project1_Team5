"use client";

import { createBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Region 타입 정의
interface Region {
  region_id: number;
  region_name: string;
}

/**
 * AI 여행 계획 생성을 위한 지역 선택 페이지 컴포넌트 (다중 선택)
 * 기능 및 라우팅은 그대로 유지하고 디자인만 개선됨
 */
function AiRegionSelectContent() {
  const searchParams = useSearchParams();

  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("region")
        .select("*")
        .order("region_id", { ascending: true});

      if (data) setRegions(data);
      else if (error) {
        console.error("지역 정보 로딩 실패:", error);
        alert("지역 정보를 불러오는 데 실패했습니다.");
      }
      setIsLoading(false);
    };
    fetchRegions();
  }, []);

  // 지역 버튼 클릭 (다중 선택)
  const handleSelectRegion = (regionName: string, regionId: number) => {
    setSelectedRegions((prev) =>
      prev.includes(regionName)
        ? prev.filter((r) => r !== regionName)
        : [...prev, regionName]
    );
    setSelectedRegionIds((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  // 이전, 다음 단계 URL 생성 함수
  const createUrl = (isNext: boolean) => {
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const params = new URLSearchParams();

    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);

    if (isNext) {
      selectedRegions.forEach((region) => params.append("region", region));
      selectedRegionIds.forEach((id) => params.append("region_id", id.toString()));
      return `/planner/ai/companion?${params.toString()}`;
    } else {
      return `/planner/ai`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            지역 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
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
            Step 1 of 5
          </p>
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            어디로 여행을 떠나시나요?
          </h1>
          <p className="text-gray-500 text-lg">
            여행하고 싶은 지역을 선택해주세요 (복수 선택 가능)
          </p>
        </div>

        {/* 지역 선택 카드 - 크기 축소 */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {regions.map((region) => {
            const isSelected = selectedRegions.includes(region.region_name);
            return (
              <button
                key={region.region_id}
                onClick={() => handleSelectRegion(region.region_name, region.region_id)}
                className={`group relative p-4 bg-white rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  isSelected
                    ? "border-blue-500 shadow-lg ring-4 ring-blue-100"
                    : "border-gray-200 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm">
                    {region.region_name}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
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
            );
          })}
        </div>

        {/* 선택된 지역 카운터 */}
        {selectedRegions.length > 0 && (
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {selectedRegions.length}개 선택됨
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
            href={selectedRegions.length > 0 ? createUrl(true) : "#"}
            className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all ${
              selectedRegions.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (selectedRegions.length === 0) e.preventDefault();
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

export default function AiRegionSelectPage() {
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
      <AiRegionSelectContent />
    </Suspense>
  );
}

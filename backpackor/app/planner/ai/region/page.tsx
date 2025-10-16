"use client";

import { createBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Region 타입 정의
interface Region {
  region_id: number;
  region_name: string;
}

/**
 * AI 여행 계획 생성을 위한 지역 선택 페이지 컴포넌트 (다중 선택)
 * 기능 및 라우팅은 그대로 유지하고 디자인만 개선됨
 */
export default function AiRegionSelectPage() {
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase
        .from("region")
        .select("*")
        .order("region_id", { ascending: true });

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
  const handleSelectRegion = (regionName: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionName)
        ? prev.filter((r) => r !== regionName)
        : [...prev, regionName]
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
      return `/planner/ai/companion?${params.toString()}`;
    } else {
      return `/planner/ai`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={createUrl(false)}
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
            어디로 여행을 떠나시나요?
          </h1>
          <p className="text-lg text-gray-600">
            여행하고 싶은 지역을 선택해주세요 (여러 개 선택 가능)
          </p>
        </div>

        {/* 지역 선택 카드 */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">지역 선택</h2>

          <div className="flex flex-wrap gap-3">
            {regions.map((region) => {
              const isSelected = selectedRegions.includes(region.region_name);
              return (
                <button
                  key={region.region_id}
                  onClick={() => handleSelectRegion(region.region_name)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {region.region_name}
                </button>
              );
            })}
          </div>

          {selectedRegions.length === 0 && (
            <div className="mt-6 text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">지역을 선택해주세요</p>
              <p className="text-sm text-gray-400 mt-1">
                여러 지역을 선택할 수 있어요
              </p>
            </div>
          )}
        </div>

        {/* 선택된 지역 태그 */}
        {selectedRegions.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>선택한 지역</span>
              <span className="text-sm font-normal text-gray-500">
                ({selectedRegions.length}개)
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map((region) => (
                <div
                  key={region}
                  className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-300 shadow-sm"
                >
                  <span className="font-medium text-gray-900">{region}</span>
                  <button
                    onClick={() => handleSelectRegion(region)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3">
          <Link
            href={createUrl(false)}
            className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            이전 단계
          </Link>
          <Link
            href={createUrl(true)}
            onClick={(e) => {
              if (selectedRegions.length === 0) e.preventDefault();
            }}
            className={`px-8 py-4 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all ${
              selectedRegions.length === 0
                ? "bg-gradient-to-r from-gray-300 to-gray-300 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
            }`}
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
          </Link>
        </div>
      </div>
    </div>
  );
}

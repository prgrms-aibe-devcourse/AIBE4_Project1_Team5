// app/planner/new/region/page.tsx
"use client";

import PlaceDetailModal from "@/components/place/detail/PlaceDetailModal";
import { createBrowserClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Region 타입 정의
interface Region {
  region_id: number;
  region_name: string;
}

/**
 * 직접 여행 계획 생성을 위한 지역 선택 페이지 컴포넌트입니다.
 */
function RegionSelectPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // 날짜 정보 가져오기
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  // 컴포넌트가 처음 렌더링될 때 Supabase에서 지역 목록을 가져옵니다.
  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase
        .from("region")
        .select("*")
        .order("region_id", { ascending: true });

      if (data) {
        setRegions(data);
      } else if (error) {
        console.error("지역 정보 로딩 실패:", error);
        alert("지역 정보를 불러오는 데 실패했습니다.");
      }
      setIsLoading(false);
    };

    fetchRegions();
  }, [supabase]);

  // 지역 버튼 클릭 시, 선택 목록에 추가하거나 제거하는 함수
  const handleSelectRegion = (regionId: number) => {
    setSelectedRegionIds((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  // 장소 클릭 핸들러 (모달 열기)
  const handlePlaceClick = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedPlaceId(null);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (selectedRegionIds.length === 0) {
      alert("최소 1개의 지역을 선택해주세요.");
      return;
    }

    const params = new URLSearchParams();
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    selectedRegionIds.forEach((regionId) => params.append("region_id", String(regionId)));

    router.push(`/planner/edit?${params.toString()}`);
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
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href={`/planner/new${
                startDate && endDate ? `?start=${startDate}&end=${endDate}` : ""
              }`}
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

          {/* 선택된 여행 정보 */}
          {startDate && endDate && (
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-8 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      여행 기간
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {format(new Date(startDate), "M월 d일", { locale: ko })} -{" "}
                      {format(new Date(endDate), "M월 d일", { locale: ko })}
                    </p>
                  </div>
                </div>
                {selectedRegionIds.length > 0 && (
                  <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                    <span className="text-sm font-bold text-gray-700">
                      {selectedRegionIds.length}개 선택
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 지역 선택 그리드 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">지역 선택</h2>

            <div className="flex flex-wrap gap-3">
              {regions.map((region) => {
                const isSelected = selectedRegionIds.includes(region.region_id);
                return (
                  <button
                    key={region.region_id}
                    onClick={() => handleSelectRegion(region.region_id)}
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

            {selectedRegionIds.length === 0 && (
              <div className="mt-6 text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">지역을 선택해주세요</p>
                <p className="text-sm text-gray-400 mt-1">
                  여러 지역을 선택할 수 있어요
                </p>
              </div>
            )}
          </div>

          {/* 선택된 지역 태그 */}
          {selectedRegionIds.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>선택한 지역</span>
                <span className="text-sm font-normal text-gray-500">
                  ({selectedRegionIds.length}개)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRegionIds.map((regionId) => {
                  const region = regions.find((r) => r.region_id === regionId);
                  if (!region) return null;
                  return (
                    <div
                      key={regionId}
                      className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-300 shadow-sm"
                    >
                      <span className="font-medium text-gray-900">{region.region_name}</span>
                      <button
                        onClick={() => handleSelectRegion(regionId)}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-3">
            <Link
              href={`/planner/new${
                startDate && endDate ? `?start=${startDate}&end=${endDate}` : ""
              }`}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              이전 단계
            </Link>
            <button
              onClick={handleNext}
              disabled={selectedRegionIds.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              일정 만들러 가기
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

      {/* 모달 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default function RegionSelectPage() {
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
      <RegionSelectPageContent />
    </Suspense>
  );
}

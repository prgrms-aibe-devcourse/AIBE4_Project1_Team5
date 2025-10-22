// 파일 위치: component/place/TravelInfoSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
// Removed CSS module import - using Tailwind CSS instead

interface TravelInfoSectionProps {
  placeAddress: string;
  travelPeriod: string;
  flightInfo: string;
  temperature?: string; // 적정 기온 추가
  bestSeason?: string; // 최적 여행시기 추가
}

export default function TravelInfoSection({
  placeAddress,
  travelPeriod,
  flightInfo,
  temperature = "15°C / 25°C",
  bestSeason = "4월 ~ 5월, 9월 ~ 11월",
}: TravelInfoSectionProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const handlePlanClick = () => {
    if (!user) {
      const confirmLogin = window.confirm(
        "로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        const currentFullPath =
          window.location.pathname +
          window.location.search +
          window.location.hash;
        sessionStorage.setItem("redirectAfterLogin", currentFullPath);
        router.push("/login");
      }
      return;
    }
    router.push("/planner");
  };

  return (
    <>
      {/* 여행 정보 섹션 */}
      <div className="bg-white rounded-xl p-5 mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900">여행 정보</h2>

        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
          <strong className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>📍</span> 위치
          </strong>
          <span className="text-sm text-gray-600">{placeAddress}</span>
        </div>

        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
          <strong className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>🌡️</span> 적정 기온
          </strong>
          <span className="text-sm text-gray-600">{temperature}</span>
        </div>

        <div className="flex justify-between items-center">
          <strong className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>⏱️</span> 적정 여행 기간
          </strong>
          <span className="text-sm text-gray-600">{travelPeriod}</span>
        </div>
      </div>

      {/* 교통 정보 섹션 */}
      <div className="bg-white rounded-xl p-5 mb-4 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-900">교통 정보</h3>

        <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-gray-100">
          <strong className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>✈️</span> 항공편 : 제주국제공항
          </strong>
          <span className="text-xs text-gray-600 ml-6">
            서울에서 약 1시간 20분
          </span>
        </div>

        <div className="flex items-center">
          <strong className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>🚗</span> 렌터카 대여 가능
          </strong>
        </div>
      </div>

      {/* 최적 여행시기 섹션 */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-900">최적 여행시기</h3>
        <p className="text-sm text-gray-700 mb-3">
          <strong className="font-semibold">추천 시기:</strong> {bestSeason}
        </p>

        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            봄과 가을에 가장 쾌적하며, 초록빛으로 물든 오름과 갈대 숲을
            감상하기에 좋습니다.
          </p>
        </div>

        <div className="w-full">
          <button
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 active:bg-blue-800"
            onClick={handlePlanClick}
          >
            여행 계획 세우기
          </button>
        </div>
      </div>
    </>
  );
}

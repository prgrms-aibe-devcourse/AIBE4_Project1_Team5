// 파일 위치: component/place/TravelInfoSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import styles from "@/app/place/[placeId]/page.module.css";

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
      <div className={styles.travelInfoSection}>
        <h2>여행 정보</h2>

        <div className={styles.infoItem}>
          <strong>
            <span>📍</span> 위치
          </strong>
          <span>{placeAddress}</span>
        </div>

        <div className={styles.infoItem}>
          <strong>
            <span>🌡️</span> 적정 기온
          </strong>
          <span>{temperature}</span>
        </div>

        <div className={styles.infoItem}>
          <strong>
            <span>⏱️</span> 적정 여행 기간
          </strong>
          <span>{travelPeriod}</span>
        </div>
      </div>

      {/* 교통 정보 섹션 */}
      <div className={styles.transportSection}>
        <h3>교통 정보</h3>

        <div className={styles.infoItem}>
          <strong>
            <span>✈️</span> 항공편 : 제주국제공항
          </strong>
          <span style={{ fontSize: "13px", color: "#666" }}>
            서울에서 약 1시간 20분
          </span>
        </div>

        <div className={styles.infoItem}>
          <strong>
            <span>🚗</span> 렌터카 대여 가능
          </strong>
        </div>
      </div>

      {/* 최적 여행시기 섹션 */}
      <div className={styles.bestSeasonSection}>
        <h3>최적 여행시기</h3>
        <p>
          <strong>추천 시기:</strong> {bestSeason}
        </p>

        <div className={styles.seasonNote}>
          <p>
            봄과 가을에 가장 쾌적하며, 초록빛으로 물든 오름과 갈대 숲을
            감상하기에 좋습니다.
          </p>
        </div>

        <div className={styles.planButtonContainer}>
          <button className={styles.planButton} onClick={handlePlanClick}>
            여행 계획 세우기
          </button>
        </div>
      </div>
    </>
  );
}

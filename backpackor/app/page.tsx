"use client";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import { createServerClient } from "@/lib/supabaseClient";
import TravelCard from "@/component/place/TravelCard";
import ReviewButton from "@/component/review/ReviewButton";
import type { TravelSummary } from "@/type/travel";
import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";

// 목업 데이터 (DB에 데이터가 없을 때 대체)
const MOCK_PLACES: TravelSummary[] = [
  {
    place_id: "jeju-mock-id",
    place_name: "제주도 (Mock)",
    place_image: "https://picsum.photos/400/200?random=1",
    average_rating: 4.8,
  },
  {
    place_id: "busan-mock-id",
    place_name: "부산 (Mock)",
    place_image: "https://picsum.photos/400/200?random=2",
    average_rating: 4.5,
  },
  {
    place_id: "seoul-mock-id",
    place_name: "서울 (Mock)",
    place_image: "https://picsum.photos/400/200?random=3",
    average_rating: 4.6,
  },
  {
    place_id: "gyeongju-mock-id",
    place_name: "경주 (Mock)",
    place_image: "https://picsum.photos/400/200?random=4",
    average_rating: 4.9,
  },
  {
    place_id: "jeonju-mock-id",
    place_name: "전주 (Mock)",
    place_image: "https://picsum.photos/400/200?random=5",
    average_rating: 4.7,
  },
  {
    place_id: "namhae-mock-id",
    place_name: "남해 (Mock)",
    place_image: "https://picsum.photos/400/200?random=6",
    average_rating: 4.5,
  },
];

export default function Page() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [places, setPlaces] = useState<TravelSummary[]>([]);

  // Supabase에서 여행지 불러오기
  useEffect(() => {
    const fetchPlaces = async () => {
      const supabase = createServerClient();
      const { data: dbPlaces, error } = await supabase
        .from("place")
        .select("place_id, place_name, place_image, average_rating")
        .order("average_rating", { ascending: false })
        .limit(6);

      if (error || !dbPlaces || dbPlaces.length < 6) {
        console.warn("DB 데이터 부족 또는 오류. 목업을 사용합니다.");
        setPlaces(MOCK_PLACES);
      } else {
        setPlaces(dbPlaces);
      }
    };

    fetchPlaces();
  }, []);

  const popularPlaces = places.slice(0, 3);
  const bestPlaces = places.slice(3, 6);

  return (
    <main className={styles["main-content"]}>
      {/* (로그인 여부에 따라 다르게 출력) */}
      <section className={styles["hero-section"]}>
        {user ? (
          <>
            <h1>
              안녕하세요, {profile?.display_name || "사용자"}님!
            </h1>
            <p>취향에 맞는 테마로, 여행을 시작해보세요.</p>
          </>
        ) : (
          <>
            <h1>어디로 떠나볼까요?</h1>
            <p>새로운 여행지를 발견하고 여행을 계획해보세요.</p>
          </>
        )}

        <div className={styles["search-bar"]}>
          <input type="text" placeholder="어디로 떠나고 싶으신가요?" />
        </div>
      </section>

      {/* 인기 여행지 */}
      <section className={styles["travel-section"]}>
        <h2>인기 여행지</h2>
        <div className={styles["card-container"]}>
          {popularPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>

      {/* 베스트 여행지 */}
      <section className={styles["travel-section"]}>
        <h2>베스트 여행지</h2>
        <div className={styles["card-container"]}>
          {bestPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>

      {/* 리뷰 버튼 */}
      <ReviewButton places={places} />
    </main>
  );
}

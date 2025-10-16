"use client";

// Link와 Backpack 아이콘을 새로 import 합니다.
import Link from "next/link";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
// [수정] 클라이언트 컴포넌트에 맞는 createBrowserClient를 import 합니다.
import TravelCard from "@/component/place/TravelCard";

import { createBrowserClient } from "@/lib/supabaseClient";
import type { TravelSummary } from "@/type/travel";
import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";

export default function Page() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const [popularPlaces, setPopularPlaces] = useState<TravelSummary[]>([]);
  const [bestPlaces, setBestPlaces] = useState<TravelSummary[]>([]);

  // [삭제] 검색창 관련 state와 핸들러 함수를 삭제했습니다.
  // const [searchTerm, setSearchTerm] = useState("");
  // const router = useRouter();
  // const handleSearch = (e: FormEvent<HTMLFormElement>) => { ... };

  useEffect(() => {
    const fetchPlaces = async () => {
      // [수정] 'use client' 컴포넌트에서는 createBrowserClient를 사용합니다.
      const supabase = createBrowserClient();

      // 1. 인기 여행지 불러오기 (찜 많은 순 상위 3개)
      const { data: popularData, error: popularError } = await supabase
        .from("place")
        .select("place_id, place_name, place_image, average_rating")
        .order("favorite_count", { ascending: false })
        .limit(3);

      if (popularError) {
        console.error("인기 여행지 로딩 실패:", popularError);
      } else {
        setPopularPlaces(popularData || []);
      }

      // 2. 베스트 여행지 불러오기 (별점 높은 순 상위 3개)
      const { data: bestData, error: bestError } = await supabase
        .rpc("get_places_with_details")
        .order("average_rating", { ascending: false })
        .limit(3);

      if (bestError) {
        console.error("베스트 여행지 로딩 실패:", bestError);
      } else {
        setBestPlaces(bestData || []);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <main className={styles["main-content"]}>
      <section className={styles["hero-section"]}>
        {user ? (
          <>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              안녕하세요, {profile?.display_name || "사용자"}님!
            </h1>
          </>
        ) : (
          <>
            <h1>어디로 떠나볼까요?</h1>
            <p>새로운 여행지를 발견하고 여행을 계획해보세요.</p>
          </>
        )}

        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-3 text-xl font-semibold text-gray-800">
            <p className="text-lg text-gray-600 mb-8">
              취향에 맞는 테마로, 여행을 시작해보세요.
            </p>
          </div>
          <Link
            href="/place"
            className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            여행지 둘러보기
          </Link>
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
      {/* <ReviewButton places={places} /> */}
    </main>
  );
}

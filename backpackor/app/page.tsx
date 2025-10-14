"use client";

import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import { createServerClient } from "@/lib/supabaseClient";
import TravelCard from "@/component/place/TravelCard";
import ReviewButton from "@/component/review/ReviewButton";
import type { TravelSummary } from "@/type/travel";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

// [수정] 목업 데이터(MOCK_PLACES)를 완전히 삭제했습니다.
// 이제 모든 데이터는 Supabase DB에서 직접 가져옵니다.

export default function Page() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  // [수정] 인기/베스트 여행지를 각각 저장할 state를 분리합니다.
  const [popularPlaces, setPopularPlaces] = useState<TravelSummary[]>([]);
  const [bestPlaces, setBestPlaces] = useState<TravelSummary[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/place?search=${searchTerm}`);
  };

  // [수정] Supabase에서 인기/베스트 여행지를 각각 불러오도록 로직을 변경합니다.
  useEffect(() => {
    const fetchPlaces = async () => {
      const supabase = createServerClient();

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
      //    (참고) 저희가 만든 DB 함수 덕분에 average_rating은 항상 최신 평균 별점을 반영합니다.
      const { data: bestData, error: bestError } = await supabase
        .rpc("get_places_with_details") // 평균 별점 계산을 위해 함수를 사용합니다.
        .order("average_rating", { ascending: false })
        .limit(3);

      if (bestError) {
        console.error("베스트 여행지 로딩 실패:", bestError);
      } else {
        // rpc 결과가 TravelSummary 타입과 호환되므로 그대로 사용합니다.
        setBestPlaces(bestData || []);
      }
    };

    fetchPlaces();
  }, []);

  // [삭제] 기존의 slice 로직은 더 이상 필요 없으므로 삭제했습니다.

  return (
    <main className={styles["main-content"]}>
      <section className={styles["hero-section"]}>
        {user ? (
          <>
            <h1>안녕하세요, {profile?.display_name || "사용자"}님!</h1>
            <p>취향에 맞는 테마로, 여행을 시작해보세요.</p>
          </>
        ) : (
          <>
            <h1>어디로 떠나볼까요?</h1>
            <p>새로운 여행지를 발견하고 여행을 계획해보세요.</p>
          </>
        )}

        <form className={styles["search-bar"]} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="어디로 떠나고 싶으신가요?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </section>

      {/* 인기 여행지 */}
      <section className={styles["travel-section"]}>
        <h2>인기 여행지 TOP3</h2>
        <div className={styles["card-container"]}>
          {/* [수정] popularPlaces state를 직접 사용합니다. */}
          {popularPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>

      {/* 베스트 여행지 */}
      <section className={styles["travel-section"]}>
        <h2>베스트 여행지 TOP3</h2>
        <div className={styles["card-container"]}>
          {/* [수정] bestPlaces state를 직접 사용합니다. */}
          {bestPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>

      {/* [수정] ReviewButton에는 두 목록을 합쳐서 전달합니다. */}
      <ReviewButton places={[...popularPlaces, ...bestPlaces]} />
    </main>
  );
}

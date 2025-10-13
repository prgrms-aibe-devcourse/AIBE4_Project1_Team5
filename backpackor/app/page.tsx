// app/page.tsx

import type { TravelSummary } from "@/type/travel";
import { createServerClient } from "@/lib/supabaseClient";
import TravelCard from "@/component/place/TravelCard";
import styles from "./HomePage.module.css"; // 1. 방금 만든 CSS 파일을 불러옵니다.
import ReviewButton from "@/component/review/ReviewButton";
// DB 데이터가 없을 때 사용할 목업 데이터
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

const Page = async () => {
  // 2. 데이터 불러오는 로직은 그대로 유지합니다 (아주 좋습니다!)
  const fetchPlaces = async (): Promise<TravelSummary[]> => {
    const supabase = createServerClient();
    const { data: dbPlaces, error: dbError } = await supabase
      .from("place")
      .select("place_id, place_name, place_image, average_rating")
      .order("average_rating", { ascending: false })
      .limit(6); // 6개만 가져오도록 제한

    if (dbError || !dbPlaces || dbPlaces.length < 6) {
      console.warn("DB 데이터 부족 또는 오류. 목업을 사용합니다.");
      return MOCK_PLACES;
    }

    return dbPlaces as TravelSummary[];
  };

  const places = await fetchPlaces();

  // 3. 데이터를 두 그룹으로 나눕니다.
  const popularPlaces = places.slice(0, 3);
  const bestPlaces = places.slice(3, 6);

  // 4. 새로운 HTML 디자인을 적용하여 화면을 구성합니다.
  return (
    <main className={styles["main-content"]}>
      <section className={styles["hero-section"]}>
        <h1>어디로 떠나볼까요?</h1>
        <p>새로운 여행지를 발견하고 여행을 계획해보세요.</p>
        <div className={styles["search-bar"]}>
          <input type="text" placeholder="어디로 떠나고 싶으신가요?" />
        </div>
      </section>

      <section className={styles["travel-section"]}>
        <h2>인기 여행지</h2>
        <div className={styles["card-container"]}>
          {popularPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>

      <section className={styles["travel-section"]}>
        <h2>베스트 여행지</h2>
        <div className={styles["card-container"]}>
          {bestPlaces.map((place) => (
            <TravelCard key={place.place_id} place={place} />
          ))}
        </div>
      </section>
      {/* 리뷰 등록 플로팅 버튼 메인 홈페이지에 추가 ( 추후 각 여행지 마다 버튼 추가로 변경 예정)*/}
      <ReviewButton places={places} />
    </main>
  );
};

export default Page;

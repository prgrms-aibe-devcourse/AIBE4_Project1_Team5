// app/page.tsx  (URL: /)

import type { TravelSummary } from "@/lib/type/travel";
import { createServerClient } from "@/lib/supabase/server";
import TravelCard from "@/components/TravelCard";

// ⭐️ DB 데이터가 없을 때 사용할 목업 데이터 ⭐️
const MOCK_PLACES: TravelSummary[] = [
  {
    place_id: "jeju-mock-id",
    place_name: "제주도 (Mock)",
    place_image: "https://picsum.photos/400/200?random=1",
    average_rating: 4.8,
  },
  // ⭐️ 누락된 부산 목업 데이터 추가 ⭐️
  {
    place_id: "busan-mock-id",
    place_name: "부산 (Mock)",
    place_image: "https://picsum.photos/400/200?random=2",
    average_rating: 4.5,
  },
  // ⭐️ 누락된 서울 목업 데이터 추가 ⭐️
  {
    place_id: "seoul-mock-id",
    place_name: "서울 (Mock)",
    place_image: "https://picsum.photos/400/200?random=3",
    average_rating: 4.6,
  },
];

// ⭐️ 서버 컴포넌트 이름 변경: Page로 변경 ⭐️
const Page = async () => {
  const fetchPlaces = async (): Promise<TravelSummary[]> => {
    const supabase = await createServerClient();

    const { data: dbPlaces, error: dbError } = await supabase
      .from("place")
      .select("place_id, place_name, place_image, average_rating")
      .order("average_rating", { ascending: false });

    if (dbError || !dbPlaces || dbPlaces.length === 0) {
      console.warn("DB 데이터 없음 또는 오류. 목업을 사용합니다.");
      return MOCK_PLACES;
    }

    return dbPlaces as TravelSummary[];
  };

  const places = await fetchPlaces();

  return (
    <div className="travel-app-container">
      <h1>여행지 둘러보기</h1>
      <div className="filter-sort-bar">
        <span>정렬: 최신순 ｜ 별점 높은순</span>
      </div>

      <div className="travel-list-grid">
        {/* TravelCard는 클라이언트 컴포넌트임 */}
        {places.map((place) => (
          <TravelCard key={place.place_id} place={place} />
        ))}
      </div>
    </div>
  );
};

export default Page;

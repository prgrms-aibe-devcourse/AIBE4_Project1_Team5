// app/place/page.tsx

import { createServerClient } from "@/lib/supabaseClient";
import TravelList from "@/component/place/TravelList";

export default async function PlacePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const supabase = createServerClient();
  const sortBy = searchParams.sort || "name_asc";

  // .from().select() 대신 .rpc()로 DB 함수를 호출합니다.
  let query = supabase.rpc("get_places_with_details");

  if (sortBy === "reviews_desc") {
    // 이제 함수가 반환하는 'review_count' 컬럼으로 정렬합니다.
    query = query.order("review_count", { ascending: false });
  } else if (sortBy === "rating_desc") {
    query = query.order("average_rating", { ascending: false });
  } else {
    query = query.order("place_name", { ascending: true });
  }

  const { data: places, error } = await query;

  if (error) {
    console.error("Error fetching places:", error);
  }

  if (error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  // TravelList.tsx의 Place 타입 정의에 'review_count: number;'를 추가해주시면
  // 아래 @ts-ignore는 지워도 됩니다.
  // @ts-ignore
  return <TravelList initialPlaces={places || []} />;
}

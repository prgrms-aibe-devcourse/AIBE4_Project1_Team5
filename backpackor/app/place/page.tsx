// app/place/page.tsx

import { createServerClient } from "@/lib/supabaseClient";
import TravelList from "@/component/place/TravelList";

export default async function PlacePage() {
  const supabase = createServerClient();
  const { data: places, error } = await supabase.from("place").select("*");

  // --- ▼▼▼ 디버깅을 위한 코드 추가 ▼▼▼ ---
  console.log("Supabase에서 불러온 데이터:", places);
  if (error) {
    console.error("Error fetching places:", error);
  }
  // --- ▲▲▲ 디버깅을 위한 코드 추가 ▲▲▲ ---

  if (error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  // 데이터가 null일 경우를 대비해, 항상 빈 배열이라도 전달하도록 수정
  return <TravelList initialPlaces={places || []} />;
}

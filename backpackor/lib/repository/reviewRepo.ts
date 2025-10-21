import { createServerClient } from "@/lib/supabaseClient";
import type { Review } from "@/types/travel";

export async function getReviewsByPlaceId(placeId: string): Promise<Review[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("review")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("리뷰 조회 오류:", error);
    throw new Error("리뷰를 불러오는 데 실패했습니다.");
  }

  return data || [];
}

// 나머지 함수들도 모두 동일하게
// 함수 내에서 supabase = createServerClient() 호출 후 사용

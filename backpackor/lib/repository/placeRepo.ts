import { createServerClient } from "@/lib/supabaseClient";

export interface PlaceDetail {
  place_id: string;
  place_name: string;
  place_description: string;
  place_image: string | null;
  place_detail_image: string | null;
  place_address: string;
  region_id: number | null;
  average_rating: number;
  favorite_count: number | null;
  // 목업 데이터 필드 추가
  recommended_stay: string;
  transportation_info: string;
}

export async function getPlaceDetail(
  placeId: string
): Promise<PlaceDetail | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("place")
    .select(
      `
      place_id,
      place_name,
      place_description,
      place_image,
      place_detail_image,
      place_address,
      region_id,
      average_rating,
      favorite_count
    `
    )
    .eq("place_id", placeId)
    .single();

  if (error) {
    console.error("getPlaceDetail error:", error);
    return null;
  }

  if (!data) return null;

  // 하드코딩 목업 데이터 추가
  const mockRecommendedStay = "2박 3일 ~ 3박 4일";
  const mockTransportationInfo = "인천/김포 공항";

  return {
    ...data,
    recommended_stay: mockRecommendedStay,
    transportation_info: mockTransportationInfo,
  };
}

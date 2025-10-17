// app/place/[placeId]/page.tsx
import { createServerClient } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import PlaceDetailContent from "@/component/place/PlaceDetailContent";
import { TravelDetail } from "@/type/travel";

interface PageProps {
  params: { placeId: string };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const supabase = createServerClient();
  const { placeId } = await params;

  // Supabase에서 placeId에 해당하는 여행지 상세 데이터 조회
  const { data, error } = await supabase
    .from("place")
    .select("*")
    .eq("place_id", placeId)
    .single();

  // 데이터 없거나 에러 발생 시 404 페이지로 이동
  if (error || !data) {
    notFound();
  }

  // 현재 로그인한 사용자 정보 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 사용자 찜 상태 초기값 false
  let initialIsFavorite = false;

  // 로그인 상태면 사용자 찜 여부 조회
  if (user) {
    const { data: favData } = await supabase
      .from("user_favorite_place")
      .select("place_id")
      .eq("user_id", user.id)
      .eq("place_id", placeId)
      .single();

    initialIsFavorite = !!favData;
  }

  // 리뷰 수와 평균 평점 계산 (수정: params.id -> placeId)
  const { data: reviews } = await supabase
    .from("review")
    .select("rating")
    .eq("place_id", placeId)
    .eq("is_public", true);

  const reviewCount = reviews?.length || 0;
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // PlaceDetailContent 컴포넌트에 리뷰 데이터 전달
  return (
    <PlaceDetailContent
      place={data as TravelDetail}
      initialIsFavorite={initialIsFavorite}
      reviewCount={reviewCount}
      averageRating={averageRating}
    />
  );
}

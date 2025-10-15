import { createServerClient } from "@/lib/supabaseClient";
import TravelList from "@/component/place/TravelList";

interface PlacePageProps {
  searchParams: {
    sort?: string;
  };
}

export default async function PlacePage({ searchParams }: PlacePageProps) {
  const supabase = createServerClient();

  // URL 파라미터가 없으면 'popularity_desc'(인기순)을 기본값으로 사용
  const sortBy = searchParams.sort || "popularity_desc";

  let query = supabase.rpc("get_places_with_details");

  // sortBy 값에 따라 정렬 순서를 적용
  switch (sortBy) {
    case "review_desc":
      // 1순위: 리뷰 많은 순, 2순위: 인기순
      query = query
        .order("review_count", { ascending: false })
        .order("favorite_count", { ascending: false });
      break;

    case "rating_desc":
      // 1순위: 별점 높은 순, 2순위: 인기순
      query = query
        .order("average_rating", { ascending: false })
        .order("favorite_count", { ascending: false });
      break;

    case "popularity_desc":
    default:
      // 기본 정렬: 인기순
      query = query.order("favorite_count", { ascending: false });
      break;
  }

  const { data: places, error } = await query;

  if (error) {
    console.error("Error fetching places:", error);
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  // @ts-ignore
  return <TravelList initialPlaces={places || []} />;
}

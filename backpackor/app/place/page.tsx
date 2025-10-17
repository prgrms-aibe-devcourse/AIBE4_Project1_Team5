// app/place/page.tsx
import { createServerClient } from "@/lib/supabaseClient";
import TravelList from "@/component/place/TravelList";
import { Place } from "@/type/place";
interface PlacePageProps {
  searchParams: {
    sort?: string;
  };
}
export default async function PlacePage({ searchParams }: PlacePageProps) {
  const supabase = createServerClient();
  const { sort } = searchParams;
  const sortBy = sort || "popularity_desc";
  try {
    // :아래를_가리키는_손_모양: RPC 대신 직접 쿼리
    let query = supabase.from("place").select("*");
    switch (sortBy) {
      case "review_desc":
        query = query.order("review_count", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "rating_desc":
        query = query.order("average_rating", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "popularity_desc":
      default:
        query = query.order("favorite_count", {
          ascending: false,
          nullsFirst: false,
        });
        break;
    }
    const { data, error } = await query;
    if (error) {
      console.error("Database query error:", error);
      return <TravelList initialPlaces={[]} />;
    }
    const places: Place[] = (data || []).map((item: any) => ({
      place_id: item.place_id,
      place_name: item.place_name,
      place_address: item.place_address ?? null,
      place_description: item.place_description ?? null,
      place_image: item.place_image ?? null,
      place_detail_image: item.place_detail_image ?? null,
      average_rating: item.average_rating ?? null,
      favorite_count: item.favorite_count ?? null,
      review_count: item.review_count ?? null,
      region_id: item.region_id ?? null,
      region: null, // region 테이블 조인이 필요하면 나중에 추가
      place_category: item.place_category ?? null,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    }));
    return <TravelList initialPlaces={places} />;
  } catch (err) {
    console.error("Unexpected error:", err);
    return <TravelList initialPlaces={[]} />;
  }
}

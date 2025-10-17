// app/place/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import TravelList from "@/component/place/TravelList";
import { Place } from "@/type/place";

export default function PlacePage() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "popularity_desc";
  const favorite = searchParams.get("favorite") === "true";

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);

      try {
        let query;

        // 찜 필터링 조건 처리
        if (favorite) {
          // ✅ 현재 로그인된 사용자 가져오기
          const {
            data: { user },
          } = await supabase.auth.getUser();

          console.log("User ID:", user?.id);

          if (!user) {
            console.log("로그인 필요");
            setPlaces([]);
            setLoading(false);
            return;
          }

          // ✅ 찜한 여행지 ID 조회
          const { data: favoriteData, error: favError } = await supabase
            .from("user_favorite_place")
            .select("place_id")
            .eq("user_id", user.id);

          console.log("Favorite Data:", favoriteData);

          if (favError) {
            console.error("Favorite fetch error:", favError);
            setPlaces([]);
            setLoading(false);
            return;
          }

          const favoritePlaceIds = favoriteData?.map((f) => f.place_id) || [];
          console.log("Favorite Place IDs:", favoritePlaceIds);

          if (favoritePlaceIds.length === 0) {
            console.log("찜한 여행지 없음");
            setPlaces([]);
            setLoading(false);
            return;
          }

          // 찜한 place만 SELECT
          query = supabase
            .from("place")
            .select("*")
            .in("place_id", favoritePlaceIds);
        } else {
          // 기본 목록
          query = supabase.from("place").select("*");
        }

        // 정렬 로직
        switch (sort) {
          case "review_desc":
            query = query.order("favorite_count", {
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

        console.log("Query Result Count:", data?.length || 0);

        if (error) {
          console.error("Database query error:", error);
          setPlaces([]);
          setLoading(false);
          return;
        }

        const fetchedPlaces: Place[] = (data || []).map((item: any) => ({
          place_id: item.place_id,
          place_name: item.place_name,
          place_address: item.place_address ?? null,
          place_description: item.place_description ?? null,
          place_image: item.place_image ?? null,
          place_detail_image: item.place_detail_image ?? null,
          average_rating: item.average_rating ?? null,
          favorite_count: item.favorite_count ?? null,
          review_count: item.review_count ?? 0,
          region_id: item.region_id ?? null,
          region: null,
          place_category: item.place_category ?? null,
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
          favorite_place_id: null,
        }));

        console.log("Final Places Count:", fetchedPlaces.length);
        setPlaces(fetchedPlaces);
      } catch (err) {
        console.error("Unexpected error:", err);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, [sort, favorite]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return <TravelList initialPlaces={places} />;
}

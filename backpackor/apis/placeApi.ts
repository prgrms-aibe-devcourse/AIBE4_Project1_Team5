import { supabase } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";

/* ------------------------------------------------------
 * 공통 정렬 유틸 함수
 * ------------------------------------------------------ */
const sortPlaces = (places: Place[], sortBy: string): Place[] => {
    return places.sort((a, b) => {
        switch (sortBy) {
            case "reviews_desc":
                // 리뷰 개수 우선
                if ((b.review_count || 0) !== (a.review_count || 0)) {
                    return (b.review_count || 0) - (a.review_count || 0);
                }
                // 리뷰 수 같을 경우 → 평점 높은 순
                if ((b.average_rating || 0) !== (a.average_rating || 0)) {
                    return (b.average_rating || 0) - (a.average_rating || 0);
                }
                // 평점도 같으면 → 찜 개수 많은 순
                return (b.favorite_count || 0) - (a.favorite_count || 0);

            case "rating_desc":
                // 평점 높은 순 우선
                if ((b.average_rating || 0) !== (a.average_rating || 0)) {
                    return (b.average_rating || 0) - (a.average_rating || 0);
                }
                // 평점이 같을 경우 → 리뷰 많은 순
                if ((b.review_count || 0) !== (a.review_count || 0)) {
                    return (b.review_count || 0) - (a.review_count || 0);
                }
                // 리뷰 수까지 같으면 → 찜 개수 많은 순
                return (b.favorite_count || 0) - (a.favorite_count || 0);

            case "popularity_desc":
            default: {
                const scoreA =
                    (a.review_count || 0) +
                    (a.favorite_count || 0) +
                    (a.average_rating || 0);
                const scoreB =
                    (b.review_count || 0) +
                    (b.favorite_count || 0) +
                    (b.average_rating || 0);
                return scoreB - scoreA;
            }
        }
    });
};

/* ------------------------------------------------------
 * 리뷰 개수 맵 생성 함수 (group() 제거)
 * ------------------------------------------------------ */
const getReviewCountMap = async (placeIds?: string[]) => {
    try {
        let query = supabase.from("review").select("place_id");
        if (placeIds && placeIds.length > 0) query = query.in("place_id", placeIds);

        const { data, error } = await query;
        if (error) {
            console.error("리뷰 데이터 조회 실패:", error);
            return new Map<string, number>();
        }

        // JS에서 직접 그룹화 (리뷰 개수 계산)
        const map = new Map<string, number>();
        (data || []).forEach((row: any) => {
            const id = row.place_id;
            map.set(id, (map.get(id) || 0) + 1);
        });
        return map;
    } catch (err) {
        console.error("리뷰 개수 계산 오류:", err);
        return new Map<string, number>();
    }
};

/* ------------------------------------------------------
 * 개별 여행지 정보
 * ------------------------------------------------------ */
export const getPlaceInfo = async (placeId: string) => {
    try {
        const { data, error } = await supabase
            .from("place")
            .select("place_name, place_address, place_image")
            .eq("place_id", placeId)
            .single();

        if (error || !data) {
            console.error("장소 정보 가져오기 실패:", error);
            return null;
        }

        return {
            place_name: data.place_name,
            place_address: data.place_address || "",
            place_image: data.place_image || "",
        };
    } catch (error) {
        console.error("장소 정보 가져오기 오류:", error);
        return null;
    }
};

/* ------------------------------------------------------
 * 모든 여행지 목록
 * ------------------------------------------------------ */
export const getAllPlaces = async (
    sortBy: string = "popularity_desc",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error } = await supabase
            .from("place")
            .select("*")
            .range(from, to);

        if (error) {
            console.error("Database query error:", error);
            return [];
        }

        const places = (data || []) as Place[];
        if (places.length === 0) return [];

        const placeIds = places.map(p => p.place_id);
        const reviewCountMap = await getReviewCountMap(placeIds);
        for (const p of places) {
            p.review_count = reviewCountMap.get(p.place_id) ?? 0;
        }

        return sortPlaces(places, sortBy);
    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
};

/* ------------------------------------------------------
 * 찜한 여행지 ID 목록
 * ------------------------------------------------------ */
export const getFavoritePlaceIds = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from("user_favorite_place")
            .select("place_id")
            .eq("user_id", userId);

        if (error) {
            console.error("Favorite fetch error:", error);
            return [];
        }

        return data?.map((f) => f.place_id) || [];
    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
};

/* ------------------------------------------------------
 * 찜한 여행지 목록
 * ------------------------------------------------------ */
export const getFavoritePlaces = async (
    userId: string,
    sortBy: string = "popularity_desc"
): Promise<Place[]> => {
    try {
        const favoritePlaceIds = await getFavoritePlaceIds(userId);
        if (favoritePlaceIds.length === 0) return [];

        const { data, error } = await supabase
            .from("place")
            .select("*")
            .in("place_id", favoritePlaceIds);

        if (error) {
            console.error("Database query error:", error);
            return [];
        }

        const places = (data || []) as Place[];
        if (places.length === 0) return [];

        const reviewCountMap = await getReviewCountMap(favoritePlaceIds);
        for (const p of places) {
            p.review_count = reviewCountMap.get(p.place_id) ?? 0;
        }

        return sortPlaces(places, sortBy);
    } catch (err) {
        console.error("Unexpected error:", err);
        return [];
    }
};

/* ------------------------------------------------------
 * 검색 필터로 여행지 검색 (검색어, 지역, 카테고리)
 * ------------------------------------------------------ */
export interface PlaceSearchFilters {
    searchQuery?: string;
    regionId?: number;
    category?: string;
}

export const searchPlaces = async (
    filters: PlaceSearchFilters,
    sortBy: string = "popularity_desc",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase.from("place").select("*");

        // 검색어 필터 (장소명, 주소, 설명에서 검색)
        if (filters.searchQuery && filters.searchQuery.trim() !== "") {
            const searchTerm = filters.searchQuery.trim();
            query = query.or(
                `place_name.ilike.%${searchTerm}%,place_address.ilike.%${searchTerm}%,place_description.ilike.%${searchTerm}%`
            );
        }

        // 지역 필터
        if (filters.regionId) {
            query = query.eq("region_id", filters.regionId);
        }

        // 카테고리 필터
        if (filters.category && filters.category.trim() !== "") {
            query = query.eq("place_category", filters.category.trim());
        }

        // 페이지네이션 적용
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Search query error:", error);
            return [];
        }

        const places = (data || []) as Place[];
        if (places.length === 0) return [];

        const placeIds = places.map(p => p.place_id);
        const reviewCountMap = await getReviewCountMap(placeIds);
        for (const p of places) {
            p.review_count = reviewCountMap.get(p.place_id) ?? 0;
        }

        return sortPlaces(places, sortBy);
    } catch (err) {
        console.error("Search unexpected error:", err);
        return [];
    }
};

/* ------------------------------------------------------
 * 총 여행지 개수 조회 (페이지네이션용)
 * ------------------------------------------------------ */
export const getTotalPlacesCount = async (
    filters?: PlaceSearchFilters
): Promise<number> => {
    try {
        let query = supabase
            .from("place")
            .select("place_id", { count: "exact", head: true });

        // 필터가 있으면 적용
        if (filters) {
            if (filters.searchQuery && filters.searchQuery.trim() !== "") {
                const searchTerm = filters.searchQuery.trim();
                query = query.or(
                    `place_name.ilike.%${searchTerm}%,place_address.ilike.%${searchTerm}%,place_description.ilike.%${searchTerm}%`
                );
            }

            if (filters.regionId) {
                query = query.eq("region_id", filters.regionId);
            }

            if (filters.category && filters.category.trim() !== "") {
                query = query.eq("place_category", filters.category.trim());
            }
        }

        const { count, error } = await query;

        if (error) {
            console.error("Count query error:", error);
            return 0;
        }

        return count || 0;
    } catch (err) {
        console.error("Count unexpected error:", err);
        return 0;
    }
};

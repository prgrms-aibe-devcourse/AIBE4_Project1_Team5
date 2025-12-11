import { supabase } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";
import { sortPlaces } from "@/utils/placeSort";

/* ------------------------------------------------------
 * 리뷰 개수 맵 생성 함수 (group() 제거)
 * ------------------------------------------------------ */
const getReviewCountMap = async (placeIds?: string[]) => {
    try {
        // 전체 리뷰를 가져와서 그룹화 (더 효율적)
        const { data, error } = await supabase
            .from("review")
            .select("place_id");

        if (error) {
            console.error("리뷰 데이터 조회 실패:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return new Map<string, number>();
        }

        // JS에서 직접 그룹화 (리뷰 개수 계산)
        const map = new Map<string, number>();
        (data || []).forEach((row: unknown) => {
            const reviewRow = row as { place_id?: string };
            const id = reviewRow.place_id;
            if (id) {
                map.set(id, (map.get(id) || 0) + 1);
            }
        });

        // placeIds가 제공된 경우, 해당 ID만 필터링해서 반환
        if (placeIds && placeIds.length > 0) {
            const filteredMap = new Map<string, number>();
            placeIds.forEach(id => {
                filteredMap.set(id, map.get(id) || 0);
            });
            return filteredMap;
        }

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
 * 모든 여행지 목록 (DB에서 완전 정렬 - View 사용)
 * ------------------------------------------------------ */
export const getAllPlaces = async (
    sortBy: string = "popularity",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // View 조회 - DB에서 review_count 계산됨
        let query = supabase.from("place_with_review_count").select("*");

        // 정렬 조건 적용
        if (sortBy === "reviews" || sortBy === "reviews_desc") {
            // 리뷰순: 리뷰 개수 → 이름
            query = query
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        } else if (sortBy === "rating" || sortBy === "rating_desc") {
            // 평점순: 평점 → 이름
            query = query
                .order("average_rating", { ascending: false })
                .order("place_name", { ascending: true });
        } else {
            // 인기순: 찜 → 평점 → 리뷰 → 이름
            query = query
                .order("favorite_count", { ascending: false })
                .order("average_rating", { ascending: false })
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        }

        // 페이징
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Database query error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return [];
        }

        const places = (data || []) as Place[];

        // 클라이언트에서 한번 더 정렬 (한글 ㄱㄴㄷ순 보장)
        const sortedPlaces = sortPlaces(places, sortBy);

        // 디버깅: 정렬 결과 확인
        if (sortBy === "popularity" || sortBy === "popularity_desc") {
            console.log("[정렬 결과] TOP 5:", sortedPlaces.slice(0, 5).map(p =>
                `${p.place_name}: 찜${p.favorite_count||0} 리뷰${p.review_count||0} 평점${(p.average_rating||0).toFixed(2)}`
            ));
        }

        return sortedPlaces;
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
 * 찜한 여행지 목록 (DB에서 완전 정렬 - View 사용)
 * ------------------------------------------------------ */
export const getFavoritePlaces = async (
    userId: string,
    sortBy: string = "popularity",
    filters?: PlaceSearchFilters
): Promise<Place[]> => {
    try {
        const favoritePlaceIds = await getFavoritePlaceIds(userId);
        if (favoritePlaceIds.length === 0) return [];

        // View 조회 - DB에서 review_count 계산됨
        let query = supabase
            .from("place_with_review_count")
            .select("*")
            .in("place_id", favoritePlaceIds);

        // 검색어 필터 적용
        if (filters?.searchQuery) {
            query = query.ilike("place_name", `%${filters.searchQuery}%`);
        }

        // 지역 필터 적용
        if (filters?.regionId) {
            query = query.eq("region_id", filters.regionId);
        }

        // 카테고리 필터 적용
        if (filters?.category) {
            query = query.eq("place_category", filters.category);
        }

        // 정렬 조건 적용
        if (sortBy === "reviews" || sortBy === "reviews_desc") {
            query = query
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        } else if (sortBy === "rating" || sortBy === "rating_desc") {
            query = query
                .order("average_rating", { ascending: false })
                .order("place_name", { ascending: true });
        } else {
            // 인기순: 찜 → 평점 → 리뷰 → 이름
            query = query
                .order("favorite_count", { ascending: false })
                .order("average_rating", { ascending: false })
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
            console.error("Database query error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return [];
        }

        const places = (data || []) as Place[];

        // 클라이언트에서 한번 더 정렬 (한글 ㄱㄴㄷ순 보장)
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
    sortBy: string = "popularity",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // View 조회 - DB에서 review_count 계산됨
        let query = supabase.from("place_with_review_count").select("*");

        // 검색어 필터 (장소명만 검색)
        if (filters.searchQuery && filters.searchQuery.trim() !== "") {
            const searchTerm = filters.searchQuery.trim();
            query = query.ilike("place_name", `%${searchTerm}%`);
        }

        // 지역 필터
        if (filters.regionId) {
            query = query.eq("region_id", filters.regionId);
        }

        // 카테고리 필터
        if (filters.category && filters.category.trim() !== "") {
            query = query.eq("place_category", filters.category.trim());
        }

        // 정렬 조건 적용
        if (sortBy === "reviews" || sortBy === "reviews_desc") {
            // 리뷰순: 리뷰 개수 → 이름
            query = query
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        } else if (sortBy === "rating" || sortBy === "rating_desc") {
            // 평점순: 평점 → 이름
            query = query
                .order("average_rating", { ascending: false })
                .order("place_name", { ascending: true });
        } else {
            // 인기순: 찜 → 평점 → 리뷰 → 이름
            query = query
                .order("favorite_count", { ascending: false })
                .order("average_rating", { ascending: false })
                .order("review_count", { ascending: false })
                .order("place_name", { ascending: true });
        }

        // 페이징
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Search query error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return [];
        }

        const places = (data || []) as Place[];

        // 클라이언트에서 한번 더 정렬 (한글 ㄱㄴㄷ순 보장)
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
                query = query.ilike("place_name", `%${searchTerm}%`);
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

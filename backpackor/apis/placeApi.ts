import { supabase } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";

/* ------------------------------------------------------
 * 공통 정렬 유틸 함수
 * ------------------------------------------------------ */
// 한글/영어/숫자/특수문자 순서로 정렬하는 함수
const compareNames = (a: string, b: string): number => {
    // 정규식으로 한글, 영어, 숫자, 특수문자 구분
    const getCharType = (char: string): number => {
        if (/[ㄱ-ㅎ가-힣]/.test(char)) return 1; // 한글
        if (/[a-zA-Z]/.test(char)) return 2; // 영어
        if (/[0-9]/.test(char)) return 3; // 숫자
        return 4; // 특수문자
    };

    const typeA = getCharType(a[0] || '');
    const typeB = getCharType(b[0] || '');

    // 타입이 다르면 타입 순서로 정렬
    if (typeA !== typeB) {
        return typeA - typeB;
    }

    // 같은 타입이면 사전순 정렬
    return a.localeCompare(b, 'ko');
};

const sortPlaces = (places: Place[], sortBy: string): Place[] => {
    return places.sort((a, b) => {
        let result = 0;

        switch (sortBy) {
            case "reviews":
            case "reviews_desc": // 하위 호환성
                // 리뷰 개수 우선
                if ((b.review_count || 0) !== (a.review_count || 0)) {
                    return (b.review_count || 0) - (a.review_count || 0);
                }
                // 리뷰 수 같을 경우 → ㄱㄴㄷ순
                return compareNames(a.place_name, b.place_name);

            case "rating":
            case "rating_desc": // 하위 호환성
                // 평점 높은 순 우선
                if ((b.average_rating || 0) !== (a.average_rating || 0)) {
                    return (b.average_rating || 0) - (a.average_rating || 0);
                }
                // 평점이 같을 경우 → ㄱㄴㄷ순
                return compareNames(a.place_name, b.place_name);

            case "popularity":
            case "popularity_desc": // 하위 호환성
            default: {
                const scoreA =
                    (a.review_count || 0) +
                    (a.favorite_count || 0) +
                    (a.average_rating || 0);
                const scoreB =
                    (b.review_count || 0) +
                    (b.favorite_count || 0) +
                    (b.average_rating || 0);

                if (scoreB !== scoreA) {
                    return scoreB - scoreA;
                }
                // 인기도가 같을 경우 → ㄱㄴㄷ순
                return compareNames(a.place_name, b.place_name);
            }
        }
    });
};

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
        (data || []).forEach((row: any) => {
            const id = row.place_id;
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
 * 모든 여행지 목록
 * ------------------------------------------------------ */
export const getAllPlaces = async (
    sortBy: string = "popularity",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 리뷰순과 인기순은 전체 데이터를 가져와서 정렬 후 페이징
        if (sortBy === "reviews" || sortBy === "reviews_desc" ||
            sortBy === "popularity" || sortBy === "popularity_desc") {
            // 전체 데이터 가져오기 (최대 10000개로 제한)
            const { data, error } = await supabase
                .from("place")
                .select("*")
                .limit(10000);

            if (error) {
                console.error("Database query error (reviews/popularity sort):", error);
                return [];
            }

            const places = (data || []) as Place[];
            if (places.length === 0) return [];

            // 모든 place의 review_count 계산
            const placeIds = places.map(p => p.place_id);
            const reviewCountMap = await getReviewCountMap(placeIds);
            for (const p of places) {
                p.review_count = reviewCountMap.get(p.place_id) ?? 0;
            }

            // 정렬
            const sortedPlaces = sortPlaces(places, sortBy);

            // 페이징
            return sortedPlaces.slice(from, to + 1);
        }

        // 평점순은 DB에서 정렬 후 페이징
        let query = supabase.from("place").select("*");

        if (sortBy === "rating" || sortBy === "rating_desc") {
            query = query.order("average_rating", { ascending: false });
        }

        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Database query error (rating sort):", error);
            return [];
        }

        const places = (data || []) as Place[];
        if (places.length === 0) return [];

        // review_count 계산 (카드에 표시용)
        const placeIds = places.map(p => p.place_id);
        const reviewCountMap = await getReviewCountMap(placeIds);
        for (const p of places) {
            p.review_count = reviewCountMap.get(p.place_id) ?? 0;
        }

        return places;
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
    sortBy: string = "popularity",
    filters?: PlaceSearchFilters
): Promise<Place[]> => {
    try {
        const favoritePlaceIds = await getFavoritePlaceIds(userId);
        if (favoritePlaceIds.length === 0) return [];

        let query = supabase
            .from("place")
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

        const { data, error } = await query;

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
    sortBy: string = "popularity",
    page: number = 1,
    limit: number = 50
): Promise<Place[]> => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 리뷰순과 인기순은 전체 필터링된 데이터를 가져와서 정렬 후 페이징
        if (sortBy === "reviews" || sortBy === "reviews_desc" ||
            sortBy === "popularity" || sortBy === "popularity_desc") {
            let query = supabase.from("place").select("*");

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

            // 전체 데이터 가져오기 (최대 10000개로 제한)
            query = query.limit(10000);

            const { data, error } = await query;

            if (error) {
                console.error("Search query error (reviews/popularity sort):", error);
                return [];
            }

            const places = (data || []) as Place[];
            if (places.length === 0) return [];

            // 모든 place의 review_count 계산
            const placeIds = places.map(p => p.place_id);
            const reviewCountMap = await getReviewCountMap(placeIds);
            for (const p of places) {
                p.review_count = reviewCountMap.get(p.place_id) ?? 0;
            }

            // 정렬
            const sortedPlaces = sortPlaces(places, sortBy);

            // 페이징
            return sortedPlaces.slice(from, to + 1);
        }

        // 평점순은 DB에서 정렬 후 페이징
        let query = supabase.from("place").select("*");

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

        if (sortBy === "rating" || sortBy === "rating_desc") {
            query = query.order("average_rating", { ascending: false });
        }

        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error("Search query error (rating sort):", error);
            return [];
        }

        const places = (data || []) as Place[];
        if (places.length === 0) return [];

        // review_count 계산 (카드에 표시용)
        const placeIds = places.map(p => p.place_id);
        const reviewCountMap = await getReviewCountMap(placeIds);
        for (const p of places) {
            p.review_count = reviewCountMap.get(p.place_id) ?? 0;
        }

        return places;
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

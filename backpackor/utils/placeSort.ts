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

export const sortPlaces = (places: Place[], sortBy: string): Place[] => {
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

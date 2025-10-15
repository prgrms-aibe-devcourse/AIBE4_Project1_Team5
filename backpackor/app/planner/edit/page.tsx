// app/planner/edit/page.tsx

import { createServerClient } from "@/lib/supabaseClient";
import PlannerEditor from "@/component/planner/PlannerEditor";

// [수정 1] Place 타입에 place_address 추가
export interface Place {
    place_id: string;
    place_name: string;
    place_image: string;
    average_rating: number;
    favorite_count: number;
    place_address: string; // <-- 이 속성을 추가합니다.
    review_count?: number; // 다른 컴포넌트와의 호환성을 위해 추가 (선택 사항)
}

// 페이지 컴포넌트가 URL의 searchParams를 통해 어떤 값들을 받을 수 있는지 정의
interface EditPlannerPageProps {
    searchParams: {
        region?: string | string[];
        aiPlan?: string;
        trip_id?: string;
    }
}

/**
 * 새로운 일정을 생성하거나 기존 일정을 수정하는 페이지입니다.
 * '생성'과 '수정' 경로를 분기하여, 각 상황에 맞는 장소 목록을 불러옵니다.
 */
export default async function EditPlannerPage({ searchParams }: EditPlannerPageProps) {
    const supabase = createServerClient();
    const { trip_id } = searchParams;

    let places: Place[] = [];
    let regionNamesForFiltering: string[] = [];

    try {
        if (trip_id) {
            // [수정 경로 로직]
            const { data: detailData, error: detailError } = await supabase
                .from('trip_plan_detail')
                .select('place_id')
                .eq('trip_id', trip_id);
            if (detailError) throw new Error(`상세 일정 정보를 가져오지 못했습니다: ${detailError.message}`);

            if (detailData && detailData.length > 0) {
                const placeIds = detailData.map(item => item.place_id);
                const { data: regionData, error: regionError } = await supabase
                    .from('place')
                    .select('region!inner(region_name)')
                    .in('place_id', placeIds);
                if (regionError) throw new Error(`장소의 지역 정보를 가져오지 못했습니다: ${regionError.message}`);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                regionNamesForFiltering = [...new Set(regionData.map((item: any) => item.region.region_name))];
            }
        } else {
            // [생성 경로 로직]
            const selectedRegions = Array.isArray(searchParams.region)
                ? searchParams.region
                : searchParams.region ? [searchParams.region] : [];
            regionNamesForFiltering = selectedRegions;
        }

        // --- 데이터 조회 시 실제 DB 컬럼명으로 요청. ---
        let query = supabase
            .from('place')
            // [수정 2] select 쿼리에 place_address 추가
            .select('place_id, place_name, place_image, average_rating, favorite_count, place_address, region!inner(region_name)');

        if (regionNamesForFiltering.length > 0) {
            query = query.in('region.region_name', regionNamesForFiltering);
        }

        const { data: placeData, error: placeError } = await query;
        if (placeError) throw placeError;

        // --- 받아온 데이터를 PlannerEditor로 전달 ---
        // [수정 3] 전달하는 데이터에 place_address 추가
        places = placeData.map(p => ({
            place_id: p.place_id,
            place_name: p.place_name,
            place_image: p.place_image,
            average_rating: p.average_rating,
            favorite_count: p.favorite_count,
            place_address: p.place_address // <-- 이 속성을 추가합니다.
        }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("장소 데이터를 불러오는 데 실패했습니다:", error.message);
        return <div>에러가 발생했습니다: 장소 목록을 불러올 수 없습니다.</div>;
    }

    console.log(`[Server] Place 데이터 로드 완료. 총 ${places.length}개.`);

    return <PlannerEditor initialPlaces={places} />;
}
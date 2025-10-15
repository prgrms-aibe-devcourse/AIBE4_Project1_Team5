// app/planner/edit/page.tsx

import { createServerClient } from "@/lib/supabaseClient";
import PlannerEditor from "@/component/planner/PlannerEditor";

// PlannerEditor와 데이터를 주고받을 때 사용할 '장소' 데이터의 타입을 정의
export interface Place {
    place_id: string;
    place_name: string;
    place_image: string;
}

// 페이지 컴포넌트가 URL의 searchParams를 통해 어떤 값들을 받을 수 있는지 정의
interface EditPlannerPageProps {
    searchParams: {
        region?: string | string[]; // 지역 (하나 또는 여러 개)
        aiPlan?: string;            // AI가 생성한 계획
        trip_id?: string;           // 수정할 일정의 ID
    }
}

/**
 * 새로운 일정을 생성하거나 기존 일정을 수정하는 페이지입니다.
 * '생성'과 '수정' 경로를 분기하여, 각 상황에 맞는 장소 목록을 불러옵니다.
 */
export default async function EditPlannerPage({ searchParams }: EditPlannerPageProps) {
    const supabase = createServerClient();
    const { trip_id } = searchParams;

    // 최종적으로 PlannerEditor에 전달될 장소 목록을 담을 빈 배열
    let places: Place[] = [];
    // '여행지 둘러보기' 목록을 필터링할 기준이 되는 지역 이름들을 담을 배열
    let regionNamesForFiltering: string[] = [];

    try {
        if (trip_id) {
            // [수정 경로]
            // console.log(`[수정 경로] trip_id: ${trip_id}. 저장된 장소로부터 지역 정보를 역추적합니다.`);

            // 1. trip_id로 'trip_plan_detail' 테이블에서 해당 일정에 속한 모든 장소들의 ID를 가져옴
            const { data: detailData, error: detailError } = await supabase
                .from('trip_plan_detail')
                .select('place_id')
                .eq('trip_id', trip_id);

            if (detailError) throw new Error(`상세 일정 정보를 가져오지 못했습니다: ${detailError.message}`);

            // 2. 만약 저장된 장소가 있다면, 해당 장소들이 어떤 지역에 속하는지 조회
            if (detailData && detailData.length > 0) {
                const placeIds = detailData.map(item => item.place_id);

                const { data: regionData, error: regionError } = await supabase
                    .from('place')
                    .select('region!inner(region_name)')
                    .in('place_id', placeIds);

                if (regionError) throw new Error(`장소의 지역 정보를 가져오지 못했습니다: ${regionError.message}`);

                // 3. 중복을 제거한 순수한 지역 이름 목록을 만들어 필터링
                regionNamesForFiltering = [...new Set(regionData.map(item => item.region.region_name))];
                // console.log(`[수정 경로] 역추적된 지역: [${regionNamesForFiltering.join(', ')}]`);
            } else {
                console.log("[수정 경로] 저장된 장소가 없어, 모든 지역의 장소를 로드합니다.");
                // 저장된 장소가 없으면 regionNamesForFiltering는 빈 배열이 되고, 아래 조회 로직에서 모든 장소를 가져옴
            }

        } else {
            // [생성 경로]
            // URL 파라미터에서 지역 정보를 추출
            const selectedRegions = Array.isArray(searchParams.region)
                ? searchParams.region
                : searchParams.region ? [searchParams.region] : [];

            regionNamesForFiltering = selectedRegions;
        }

        // --- 데이터 조회 로직 ---
        let query = supabase
            .from('place')
            .select('place_id, place_name, place_image, region!inner(region_name)');

        // 필터링할 지역이 있는 경우에만 (.in() 필터를 추가
        if (regionNamesForFiltering.length > 0) {
            query = query.in('region.region_name', regionNamesForFiltering);
            console.log(`[DB 조회] [${regionNamesForFiltering.join(', ')}] 지역의 장소를 조회합니다.`);
        } else {
            console.log(`[DB 조회] 필터링할 지역이 없어, 모든 지역의 장소를 조회합니다.`);
        }

        const { data: placeData, error: placeError } = await query;
        if (placeError) throw placeError;

        // DB에서 join으로 가져온 데이터에는 region 객체가 포함되어 있으므로
        // .map()을 사용해 Place 타입에 맞는 순수한 객체 배열로 변환
        places = placeData.map(p => ({
            place_id: p.place_id,
            place_name: p.place_name,
            place_image: p.place_image
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("장소 데이터를 불러오는 데 실패했습니다:", error.message);
        return <div>에러가 발생했습니다: 장소 목록을 불러올 수 없습니다.</div>;
    }

    console.log(`[Server] Place 데이터 로드 완료. 총 ${places.length}개.`);

    // 최종적으로 가공된 장소 목록을 PlannerEditor 컴포넌트에 props로 전달
    return <PlannerEditor initialPlaces={places} />;
}
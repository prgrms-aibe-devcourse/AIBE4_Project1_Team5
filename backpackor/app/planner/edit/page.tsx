// app/planner/edit/page.tsx

import PlannerEditor from "@/component/planner/PlannerEditor";
import { createServerClient } from "@/lib/supabaseClient";

export interface Place {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
  favorite_count: number;
  region: string; // ✨ 1. Place 타입에 region 필드 추가
}

// Next.js 15+ searchParams 타입 정의
interface EditPlannerPageProps {
  searchParams: Promise<{
    region?: string | string[];
    aiPlan?: string;
    trip_id?: string;
    start?: string;
    end?: string;
  }>;
}

/**
 * 새로운 일정을 생성하거나 기존 일정을 수정하는 페이지입니다.
 * '생성'과 '수정' 경로를 분기하여, 각 상황에 맞는 장소 목록을 불러옵니다.
 */
export default async function EditPlannerPage({
  searchParams,
}: EditPlannerPageProps) {
  // searchParams는 Promise이므로 await 필요
  const params = await searchParams;
  const supabase = createServerClient();
  const { trip_id, region } = params;

  let places: Place[] = [];
  let regionNamesForFiltering: string[] = [];

  try {
    if (trip_id) {
      // [수정 경로 로직]
      console.log(`[Server] 기존 일정 수정 모드 (trip_id: ${trip_id})`);

      const { data: detailData, error: detailError } = await supabase
        .from("trip_plan_detail")
        .select("place_id")
        .eq("trip_id", trip_id);

      if (detailError) {
        throw new Error(
          `상세 일정 정보를 가져오지 못했습니다: ${detailError.message}`
        );
      }

      if (detailData && detailData.length > 0) {
        const placeIds = detailData.map((item) => item.place_id);
        const { data: regionData, error: regionError } = await supabase
          .from("place")
          .select("region!inner(region_name)")
          .in("place_id", placeIds);

        if (regionError) {
          throw new Error(
            `장소의 지역 정보를 가져오지 못했습니다: ${regionError.message}`
          );
        }

        regionNamesForFiltering = [
          ...new Set(regionData.map((item: any) => item.region.region_name)),
        ];

        console.log(
          `[Server] 필터링할 지역: ${regionNamesForFiltering.join(", ")}`
        );
      }
    } else {
      // [생성 경로 로직]
      console.log("[Server] 새 일정 생성 모드");

      const selectedRegions = Array.isArray(region)
        ? region
        : region
        ? [region]
        : [];
      regionNamesForFiltering = selectedRegions;

      console.log(
        `[Server] 선택된 지역: ${regionNamesForFiltering.join(", ")}`
      );
    }

    // 장소 데이터 조회
    let query = supabase
      .from("place")
      .select(
        "place_id, place_name, place_image, average_rating, favorite_count, region!inner(region_name)"
      );

    if (regionNamesForFiltering.length > 0) {
      query = query.in("region.region_name", regionNamesForFiltering);
    }

    const { data: placeData, error: placeError } = await query;

    if (placeError) {
      throw new Error(`장소 데이터 조회 실패: ${placeError.message}`);
    }

    // ✨ 2. 데이터 매핑 수정: places 객체에 region 정보 포함
    places = (placeData || []).map((p: any) => ({
      place_id: p.place_id,
      place_name: p.place_name,
      place_image: p.place_image,
      average_rating: p.average_rating,
      favorite_count: p.favorite_count,
      region: p.region.region_name,
    }));

    console.log(`[Server] Place 데이터 로드 완료. 총 ${places.length}개`);
  } catch (error: any) {
    console.error("[Server] 장소 데이터 로드 실패:", error.message);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* ... (기존 에러 UI) ... */}
      </div>
    );
  }

  // 장소가 없을 때 처리
  if (places.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* ... (기존 '장소 없음' UI) ... */}
      </div>
    );
  }

  return (
    <PlannerEditor
      initialPlaces={places}
      regionOptions={regionNamesForFiltering} // ✨ 3. PlannerEditor에 props로 지역 목록 전달
    />
  );
}
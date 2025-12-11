// app/planner/edit/page.tsx
import PlannerEditor from "@/components/planner/editor/PlannerEditor";
import { createServerClient } from "@/lib/supabaseClient";
import type { Place, Plan } from "@/types/place";

interface EditPlannerPageProps {
  searchParams: Promise<{
    region_id?: string | string[];
    aiPlan?: string;
    trip_id?: string;
    start?: string;
    end?: string;
  }>;
}

/**
 * 새로운 일정을 생성하거나 기존 일정을 수정하는 페이지입니다.
 */
export default async function EditPlannerPage({
  searchParams,
}: EditPlannerPageProps) {
  const params = await searchParams;
  const supabase = createServerClient();
  const { trip_id, region_id } = params;

  let places: Place[] = [];
  let regionIdsForFiltering: number[] = [];
  let existingTripTitle = "";
  let existingPlan: Plan = {};

  try {
    if (trip_id) {
      // 1. 기존 여행 제목 가져오기
      const { data: tripData, error: tripError } = await supabase
        .from("trip_plan")
        .select("trip_title")
        .eq("trip_id", trip_id)
        .single();

      if (tripError) {
        throw new Error(
          `여행 정보를 가져오지 못했습니다: ${tripError.message}`
        );
      }

      existingTripTitle = tripData?.trip_title || "";

      // 2. 기존 일정 상세 정보 가져오기
      const { data: detailData, error: detailError } = await supabase
        .from("trip_plan_detail")
        .select(
          `
          day_number,
          visit_order,
          place_id,
          place:place_id (
            place_id,
            place_name,
            place_address,
            latitude,
            longitude,
            place_image,
            average_rating,
            favorite_count,
            region!inner(region_name)
          )
        `
        )
        .eq("trip_id", trip_id)
        .order("day_number", { ascending: true })
        .order("visit_order", { ascending: true });

      if (detailError) {
        throw new Error(
          `상세 일정 정보를 가져오지 못했습니다: ${detailError.message}`
        );
      }

      if (detailData && detailData.length > 0) {
        // 3. 기존 일정을 Plan 형태로 변환
        existingPlan = detailData.reduce((acc: Plan, item: unknown) => {
          const detailItem = item as {
            day_number: number;
            visit_order: number;
            place: {
              place_id: string;
              place_name: string;
              place_address?: string;
              latitude?: number;
              longitude?: number;
              place_image?: string;
              average_rating?: number;
              favorite_count?: number;
              region?: { region_id: number };
            };
          };
          const day = detailItem.day_number;
          if (!acc[day]) acc[day] = [];

          acc[day].push({
            place_id: detailItem.place.place_id,
            place_name: detailItem.place.place_name,
            place_address: detailItem.place.place_address,
            latitude: detailItem.place.latitude,
            longitude: detailItem.place.longitude,
            place_image: detailItem.place.place_image,
            average_rating: detailItem.place.average_rating,
            favorite_count: detailItem.place.favorite_count,
            visit_order: detailItem.visit_order,
            day_number: detailItem.day_number,
            review_count: null,
            place_description: null,
            region_id: detailItem.place.region?.region_id || null,
            place_category: null,
          });

          return acc;
        }, {});

        // 4. 지역 ID 정보 추출
        const placeIds = detailData.map((item: unknown) => (item as { place_id: string }).place_id);
        const { data: regionData, error: regionError } = await supabase
          .from("place")
          .select("region_id")
          .in("place_id", placeIds);

        if (regionError) {
          throw new Error(
            `장소의 지역 정보를 가져오지 못했습니다: ${regionError.message}`
          );
        }

        regionIdsForFiltering = [
          ...new Set(regionData.map((item: unknown) => (item as { region_id: number }).region_id)),
        ];
      }
    } else {
      const selectedRegionIds = Array.isArray(region_id)
        ? region_id.map(Number)
        : region_id
        ? [Number(region_id)]
        : [];
      regionIdsForFiltering = selectedRegionIds;
    }

    // 장소 데이터 조회 (주소, 좌표 포함)
    let query = supabase.from("place").select(
      `
        place_id,
        place_name,
        place_address,
        latitude,
        longitude,
        place_image,
        average_rating,
        favorite_count,
        region_id
      `
    );

    if (regionIdsForFiltering.length > 0) {
      query = query.in("region_id", regionIdsForFiltering);
    }

    const { data: placeData, error: placeError } = await query;

    if (placeError) {
      throw new Error(`장소 데이터 조회 실패: ${placeError.message}`);
    }

    // 필드 매핑
    places = (placeData || []).map((p: unknown) => {
      const placeItem = p as {
        place_id: string;
        place_name: string;
        place_address?: string;
        latitude?: number;
        longitude?: number;
        place_image?: string;
        average_rating?: number;
        favorite_count?: number;
        region_id?: number;
      };
      return {
        place_id: placeItem.place_id,
        place_name: placeItem.place_name,
        place_address: placeItem.place_address,
        latitude: placeItem.latitude,
        longitude: placeItem.longitude,
        place_image: placeItem.place_image,
        average_rating: placeItem.average_rating,
        favorite_count: placeItem.favorite_count,
        review_count: null,
        place_description: null,
        region_id: placeItem.region_id || null,
        place_category: null,
      };
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              데이터를 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 장소 없음 처리
  if (places.length === 0 && !trip_id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <svg
              className="w-20 h-20 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              선택한 지역에 여행지가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              다른 지역을 선택하거나 지역을 추가해보세요
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              지역 다시 선택하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlannerEditor
      initialPlaces={places}
      regionIds={regionIdsForFiltering}
      existingTripTitle={existingTripTitle}
      existingPlan={existingPlan}
    />
  );
}

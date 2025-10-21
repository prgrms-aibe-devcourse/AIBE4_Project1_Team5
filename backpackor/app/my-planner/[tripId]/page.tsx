// app/my-planner/[tripId]/page.tsx

import KakaoMultiRouteMap from "@/components/map/KakaoMultiRouteMap";
import TripDetailClient from "@/components/my-planner/TripDetailClient";
import { createServerClient } from "@/lib/supabaseClient";
import type { Place } from "@/types/place";
import { notFound } from "next/navigation";

interface TripDetailPageProps {
  params: { tripId: string };
}

interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
}

interface TripPlanDetailRow {
  day_number: number;
  visit_order: number;
  place: Place;
}

type GroupedDetails = Record<number, TripPlanDetailRow[]>;

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const supabase = createServerClient();
  const { tripId } = await params;

  // 일정 기본 정보
  const { data: plan, error: planError } = await supabase
    .from("trip_plan")
    .select("trip_id, trip_title, trip_start_date, trip_end_date")
    .eq("trip_id", tripId)
    .single();

  if (planError || !plan) notFound();

  // 상세 일정 + 장소 좌표
  const { data: details, error: detailsError } = await supabase
    .from("trip_plan_detail")
    .select(
      `
      day_number,
      visit_order,
      place (
        place_id,
        place_name,
        place_image,
        place_address,
        latitude,
        longitude
      )
    `
    )
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true })
    .order("visit_order", { ascending: true });

  if (detailsError) {
    console.error("상세 일정 조회 실패:", detailsError);
    notFound();
  }

  // ✅ Supabase 반환 데이터 명시적 캐스팅
  const rows = (details ?? []) as unknown as TripPlanDetailRow[];

  // ✅ Day별 그룹화 (타입 지정)
  const groupedDetails = rows.reduce<GroupedDetails>((acc, detail) => {
    const day = detail.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(detail);
    return acc;
  }, {} as GroupedDetails);

  // ✅ 지도 데이터 변환
  const mapPlan = Object.fromEntries(
    Object.entries(groupedDetails).map(([day, details]) => [
      Number(day),
      details
        .map((d, idx) => ({
          order: idx + 1,
          id: d.place.place_id,
          name: d.place.place_name,
          latitude: Number(d.place.latitude),
          longitude: Number(d.place.longitude),
        }))
        .filter(
          (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
        ),
    ])
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 왼쪽: 일정 상세 */}
        <div className="lg:col-span-5">
          <TripDetailClient plan={plan} groupedDetails={groupedDetails} />
        </div>

        {/* 오른쪽: Kakao 지도 */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <KakaoMultiRouteMap
              plan={mapPlan as any}
              kakaoApiKey={process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

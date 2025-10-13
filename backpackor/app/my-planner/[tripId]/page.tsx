// app/my-planner/[tripId]/page.tsx 특정 여행일정의 상세 정보를 서버에서 불러와 보여주는 동적 상세 페이지

import TripDetailClient from "@/component/my-planner/TripDetailClient"; // [추가] 클라이언트 컴포넌트를 import
import { createServerClient } from "@/lib/supabaseClient";
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
interface Place {
  place_id: string;
  place_name: string;
  place_image: string;
}
interface TripPlanDetail {
  day_number: number;
  visit_order: number;
  place: Place;
}
type GroupedDetails = Record<number, TripPlanDetail[]>;

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const supabase = createServerClient();
  const { tripId } = params;

  const { data: plan, error: planError } = await supabase
    .from("trip_plan")
    .select("trip_id, trip_title, trip_start_date, trip_end_date")
    .eq("trip_id", tripId)
    .single();
  const { data: details, error: detailsError } = await supabase
    .from("trip_plan_detail")
    .select("day_number, visit_order, place (*)")
    .eq("trip_id", tripId)
    .order("day_number")
    .order("visit_order");

  if (planError || !plan) {
    notFound();
  }
  if (detailsError) {
    // ... 에러 처리
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedDetails = (details || []).reduce(
    (acc: GroupedDetails, detail: any) => {
      const day = detail.day_number;
      if (!acc[day]) acc[day] = [];
      acc[day].push(detail);
      return acc;
    },
    {} as GroupedDetails
  );

  // 직접 JSX를 렌더링하는 대신, Client 컴포넌트에 데이터를 props로 전달하여 렌더링
  return <TripDetailClient plan={plan} groupedDetails={groupedDetails} />;
}

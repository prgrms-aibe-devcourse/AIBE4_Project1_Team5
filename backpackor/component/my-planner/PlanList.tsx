// component/my-planner/PlanList.tsx
"use client";

import TripPlanCard from "@/component/my-planner/TripPlanCard";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
  created_at: string;
}

interface PlanListProps {
  initialPlans: TripPlan[];
}

export default function PlanList({ initialPlans }: PlanListProps) {
  const [plans, setPlans] = useState<TripPlan[]>(initialPlans);

  // initialPlans가 변경되면 plans도 업데이트
  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const handleDelete = async (tripId: number) => {
    const isConfirmed = confirm(
      "정말 이 일정을 삭제하시겠습니까? 관련된 모든 상세 일정이 함께 삭제됩니다."
    );
    if (!isConfirmed) {
      return;
    }

    try {
      // 상세 일정(trip_plan_detail) 먼저 삭제
      const { error: detailError } = await supabase
        .from("trip_plan_detail")
        .delete()
        .eq("trip_id", tripId);

      if (detailError) throw detailError;

      // 메인 일정(trip_plan) 삭제
      const { error: planError } = await supabase
        .from("trip_plan")
        .delete()
        .eq("trip_id", tripId);

      if (planError) throw planError;

      // 로컬 상태에서 삭제된 항목 제거 (새로고침 없이)
      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.trip_id !== tripId)
      );

      alert("일정이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  // plans 배열이 비어있으면 빈 상태 표시
  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <TripPlanCard
          key={plan.trip_id}
          plan={plan}
          onDelete={() => handleDelete(plan.trip_id)}
        />
      ))}
    </main>
  );
}

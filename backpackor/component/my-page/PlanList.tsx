// component/my-page/PlanList.tsx '내 일정' 목록의 UI를 그리고, 삭제와 같은 사용자 상호작용을 처리하는 클라이언트 컴포넌트
'use client';

import TripPlanCard from "@/component/my-page/TripPlanCard";
import { createBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
    const supabase = createBrowserClient();
    const router = useRouter();

    const handleDelete = async (tripId: number) => {
        // 1. 사용자에게 정말 삭제할 것인지 확인받습니다.
        const isConfirmed = confirm("정말 이 일정을 삭제하시겠습니까? 관련된 모든 상세 일정이 함께 삭제됩니다.");
        if (!isConfirmed) {
            return;
        }

        try {
            // 2. 상세 일정(trip_plan_detail) 먼저 삭제
            const { error: detailError } = await supabase
                .from('trip_plan_detail')
                .delete()
                .eq('trip_id', tripId);

            if (detailError) throw detailError;

            // 3. 메인 일정(trip_plan) 삭제
            const { error: planError } = await supabase
                .from('trip_plan')
                .delete()
                .eq('trip_id', tripId);

            if (planError) throw planError;

            alert("일정이 성공적으로 삭제되었습니다.");

            // 4. 페이지를 새로고침하여 목록을 갱신합니다.
            router.refresh();

        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
            alert("일정 삭제에 실패했습니다.");
        }
    };

    return (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialPlans?.map((plan) => (
                <TripPlanCard key={plan.trip_id} plan={plan} onDelete={() => handleDelete(plan.trip_id)} />
            ))}
        </main>
    );
}
// component/my-planner/TripDetailClient.tsx 일정 상세페이지의 UI를 그리고, 수정/삭제 등 상호작용을 처리하는 클라이언트 컴포넌트
'use client';

import { createBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface TripDetailClientProps {
    plan: TripPlan;
    groupedDetails: GroupedDetails;
}

export default function TripDetailClient({ plan, groupedDetails }: TripDetailClientProps) {
    const supabase = createBrowserClient();
    const router = useRouter();

    const handleDelete = async () => {
        const isConfirmed = confirm("정말 이 일정을 삭제하시겠습니까? 되돌릴 수 없습니다.");
        if (!isConfirmed) return;

        try {
            // 1. 상세 일정 먼저 삭제
            await supabase.from('trip_plan_detail').delete().eq('trip_id', plan.trip_id);
            // 2. 메인 일정 삭제
            await supabase.from('trip_plan').delete().eq('trip_id', plan.trip_id);

            alert("일정이 삭제되었습니다.");
            router.push('/my-page'); // 삭제 후 목록 페이지로 이동
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
            alert("일정 삭제에 실패했습니다.");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <Link href="/my-planner" className="text-blue-500 hover:underline mb-2 inline-block">&larr; 내 일정 목록으로 돌아가기</Link>
                        <h1 className="text-4xl font-bold">{plan.trip_title}</h1>
                        <p className="text-lg text-gray-500">{plan.trip_start_date} ~ {plan.trip_end_date}</p>
                    </div>
                    {/* 버튼들을 담을 div */}
                    <div className="flex flex-col gap-2">
                        <Link
                            href={`/planner/edit?trip_id=${plan.trip_id}&start=${plan.trip_start_date}&end=${plan.trip_end_date}`}
                            className="px-4 py-2 text-center bg-gray-200 font-semibold rounded-lg text-sm hover:bg-gray-300"
                        >
                            수정하기 ✏️
                        </Link>
                        {/* 삭제 버튼 */}
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-sm hover:bg-red-200"
                        >
                            삭제하기 🗑️
                        </button>
                    </div>
                </div>
            </header>

            <main className="space-y-6">
                {Object.keys(groupedDetails).length > 0 ? (
                    Object.keys(groupedDetails).map(day => (
                        <div key={day}>
                            <h2 className="text-2xl font-semibold mb-3">Day {day}</h2>
                            <div className="space-y-4">
                                {groupedDetails[Number(day)].map(detail => (
                                    <div key={detail.visit_order} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow">
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white font-bold rounded-full flex items-center justify-center">{detail.visit_order}</span>
                                        <img src={detail.place.place_image} alt={detail.place.place_name} className="w-20 h-20 object-cover rounded-md" />
                                        <h3 className="font-semibold">{detail.place.place_name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">아직 등록된 상세 일정이 없습니다.</p>
                )}
            </main>
        </div>
    );
}
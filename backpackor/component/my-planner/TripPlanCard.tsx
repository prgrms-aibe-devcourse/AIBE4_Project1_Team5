// component/my-planner/TripPlanCard.tsx 여행일정 한 개의 요약 정보를 보여주는 재사용 가능한 카드 UI 컴포넌트

import Link from 'next/link';
import { differenceInDays } from 'date-fns';

interface TripPlan {
    trip_id: number;
    trip_title: string;
    trip_start_date: string;
    trip_end_date: string;
    created_at: string;
}

interface TripPlanCardProps {
    plan: TripPlan;
    onDelete: () => void;
}

export default function TripPlanCard({ plan, onDelete }: TripPlanCardProps) {
    let tripDuration = '';
    try {
        const startDate = new Date(plan.trip_start_date);
        const endDate = new Date(plan.trip_end_date);
        const nights = differenceInDays(endDate, startDate);
        const days = nights + 1;

        if (nights > 0 && days > 0) {
            tripDuration = `${nights}박 ${days}일`;
        } else if (days === 1) {
            tripDuration = '당일치기';
        }
    } catch (e) {
        console.error("날짜 형식이 잘못되었습니다.", e);
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">대표 이미지</span>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{plan.trip_title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                    🗓️ {plan.trip_start_date} ~ {plan.trip_end_date}
                </p>

                {/* 여행 기간을 표시하고, 지역 표시는 주석 처리 */}
                <p className="text-sm text-gray-600 mb-4">
                    🕒 {tripDuration}
                </p>
                {/* <p className="text-sm text-gray-600 mb-4">
                    📍 서울
                </p>
                */}

                <div className="flex gap-2">
                    <Link href={`/my-planner/${plan.trip_id}`} className="flex-1 text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg text-sm hover:bg-blue-600">
                        상세보기
                    </Link>
                    <Link
                        href={`/planner/edit?trip_id=${plan.trip_id}&start=${plan.trip_start_date}&end=${plan.trip_end_date}`}
                        className="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                    >
                        수정
                    </Link>
                    <button
                        onClick={onDelete}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
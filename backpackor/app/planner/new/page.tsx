// app/planner/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter 훅 import
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns'; // 날짜 포맷을 위한 함수 import
import type { DateRange } from 'react-day-picker';

export default function NewPlannerPage() {
    const router = useRouter(); // router 훅 사용 준비
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    // '다음' 버튼 클릭 시 실행될 함수
    const handleNextClick = () => {
        // 시작일과 종료일이 모두 선택되었는지 확인
        if (!selectedRange || !selectedRange.from || !selectedRange.to) {
            alert('여행 시작일과 종료일을 모두 선택해주세요.');
            return; // 함수 종료
        }

        // 날짜를 'YYYY-MM-DD' 형식의 문자열로 변환
        const startDate = format(selectedRange.from, 'yyyy-MM-dd');
        const endDate = format(selectedRange.to, 'yyyy-MM-dd');

        // 쿼리 파라미터와 함께 다음 페이지로 이동
        router.push(`/planner/edit?start=${startDate}&end=${endDate}`);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen">
            <h1 className="text-3xl font-bold">여행 날짜를 선택해주세요.</h1>
            <p className="text-gray-600 mt-2 mb-8">
                여행의 시작일과 종료일을 선택하면, 나만의 일정을 만들 수 있습니다.
            </p>

            <div className="border rounded-lg p-4 bg-white">
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                />
            </div>

            {/* 버튼에 onClick 이벤트 핸들러 연결 */}
            <button
                onClick={handleNextClick}
                className="mt-8 px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
                다음
            </button>
        </div>
    );
}
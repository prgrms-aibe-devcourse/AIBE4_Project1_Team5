// app/planner/ai/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import Link from 'next/link';

/**
 * AI 여행 계획 생성을 위한 날짜 선택 페이지 컴포넌트입니다.
 */
export default function AiPlannerDatePage() {
    const router = useRouter();
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    const handleNextClick = () => {
        if (!selectedRange || !selectedRange.from || !selectedRange.to) {
            alert('여행 시작일과 종료일을 모두 선택해주세요.');
            return;
        }

        const startDate = format(selectedRange.from, 'yyyy-MM-dd');
        const endDate = format(selectedRange.to, 'yyyy-MM-dd');

        router.push(`/planner/ai/companion?start=${startDate}&end=${endDate}`);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold">여행 날짜를 선택해주세요.</h1>
            <p className="text-gray-600 mt-2 mb-8">
                AI 추천을 위해 여행의 시작일과 종료일을 선택해주세요.
            </p>

            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                />
            </div>

            <div className="flex gap-4 mt-8">
                <Link href="/planner" className="px-8 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                    이전
                </Link>
                <button
                    onClick={handleNextClick}
                    className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
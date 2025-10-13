// app/planner/ai/companion/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 동행 선택 페이지 컴포넌트입니다.
 */
export default function AiPlannerCompanionPage() {
    const searchParams = useSearchParams();
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const region = searchParams.get('region');

    const companionOptions = [
        { name: "혼자", value: "alone" },
        { name: "친구와", value: "friends" },
        { name: "부모님과", value: "family" },
        { name: "아이와", value: "kids" },
        { name: "연인과", value: "couple" }
    ];

    const nextStepUrl = selectedCompanion
        ? `/planner/ai/style?start=${startDate}&end=${endDate}&region=${region}&companion=${selectedCompanion}`
        : '#';

    const previousStepUrl = `/planner/ai/region?start=${startDate}&end=${endDate}`;

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pt-24">
            <div className="w-full max-w-2xl text-center">
                <p className="text-blue-500 font-semibold mb-2">여행 스타일 선택 (2/5)</p>
                <h1 className="text-3xl font-bold mb-4">누구와 함께 여행을 떠나시나요?</h1>

                <div className="grid grid-cols-3 gap-4 my-8">
                    {companionOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedCompanion(option.value)}
                            className={`p-6 bg-white border rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all ${selectedCompanion === option.value ? 'border-blue-500 border-2' : ''}`}
                        >
                            <span className="text-lg">{option.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <Link href={previousStepUrl} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={nextStepUrl}
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 ${!selectedCompanion ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => { if (!selectedCompanion) e.preventDefault(); }}
                    >
                        다음 단계
                    </Link>
                </div>
            </div>
        </div>
    );
}
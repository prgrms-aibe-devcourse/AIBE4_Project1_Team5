// app/planner/ai/companion/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 동행 선택 페이지 컴포넌트
 */
export default function AiPlannerCompanionPage() {
    const searchParams = useSearchParams();
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

    // .get('region') 대신 .getAll('region')을 사용하여 모든 지역 정보를 배열로 가져옵니다.
    const regions = searchParams.getAll('region');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const companionOptions = [
        { name: "혼자", value: "alone" },
        { name: "친구와", value: "friends" },
        { name: "부모님과", value: "family" },
        { name: "아이와", value: "kids" },
        { name: "연인과", value: "couple" }
    ];

    /**
     * @param isNext '다음 단계'로 갈 것인지 여부
     */
    const createUrl = (isNext: boolean) => {
        const params = new URLSearchParams();

        // 기본 파라미터 (날짜, 지역)를 먼저 추가합니다.
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        // regions 배열을 순회하며 모든 지역 정보를 같은 이름('region')으로 파라미터에 추가합니다.
        regions.forEach(region => params.append('region', region));

        if (isNext) {
            // '다음 단계'일 경우, 현재 페이지에서 선택한 동행 정보를 추가합니다.
            if (selectedCompanion) params.append('companion', selectedCompanion);
            return `/planner/ai/style?${params.toString()}`;
        } else {
            // '이전 단계'일 경우, 지역 선택 페이지로 돌아갑니다.
            return `/planner/ai/region?${params.toString()}`;
        }
    };

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
                    {/* 이전 단계와 다음 단계 링크 모두 createUrl 함수를 사용하도록 변경 */}
                    <Link href={createUrl(false)} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={selectedCompanion ? createUrl(true) : '#'}
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
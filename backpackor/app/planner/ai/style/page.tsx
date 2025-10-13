// app/planner/ai/style/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 여행 스타일 선택 페이지 컴포넌트입니다.
 */
export default function AiPlannerStylePage() {
    const searchParams = useSearchParams();
    // 상태에는 영어(value) 값들의 배열을 저장합니다.
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const companion = searchParams.get('companion');

    // 옵션을 객체 배열로 관리
    const styleOptions = [
        { name: "자연, 힐링", value: "nature" },
        { name: "맛집, 음식", value: "food" },
        { name: "문화, 역사", value: "culture" },
        { name: "액티비티, 체험", value: "activity" },
        { name: "쇼핑", value: "shopping" },
        { name: "포토스팟, SNS 핫플", value: "photo" }
    ];

    // 클릭 시 영어(value)를 기준으로 상태를 업데이트합니다.
    const handleStyleClick = (styleValue: string) => {
        setSelectedStyles(prev =>
            prev.includes(styleValue)
                ? prev.filter(s => s !== styleValue)
                : [...prev, styleValue]
        );
    };

    const nextStepUrl = () => {
        if (selectedStyles.length === 0) return '#';

        const params = new URLSearchParams();
        params.append('start', startDate || '');
        params.append('end', endDate || '');
        params.append('companion', companion || '');
        // URL에도 영어(value)를 추가합니다.
        selectedStyles.forEach(style => params.append('style', style));

        return `/planner/ai/speed?${params.toString()}`;
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pt-24">
            <div className="w-full max-w-2xl text-center">
                <p className="text-blue-500 font-semibold mb-2">여행 스타일 선택 (2/4)</p>
                <h1 className="text-3xl font-bold mb-4">어떤 스타일의 여행을 원하시나요?</h1>
                <p className="text-gray-500">원하는 스타일을 모두 선택해주세요.</p>

                <div className="grid grid-cols-3 gap-4 my-8">
                    {styleOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleStyleClick(option.value)}
                            className={`p-4 bg-white border rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-center ${selectedStyles.includes(option.value) ? 'border-blue-500 border-2' : ''}`}
                        >
                            <span className="text-md">{option.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <Link href={`/planner/ai/companion?start=${startDate}&end=${endDate}`} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={nextStepUrl()}
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 ${selectedStyles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => { if (selectedStyles.length === 0) e.preventDefault(); }}
                    >
                        다음 단계
                    </Link>
                </div>
            </div>
        </div>
    );
}
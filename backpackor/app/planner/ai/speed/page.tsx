// app/planner/ai/speed/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 여행 속도 선택 페이지 컴포넌트입니다.
 */
export default function AiPlannerSpeedPage() {
    const searchParams = useSearchParams();
    const [selectedSpeed, setSelectedSpeed] = useState<string>('normal');

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const region = searchParams.get('region');
    const companion = searchParams.get('companion');
    const styles = searchParams.getAll('style');

    const speedOptions = [
        { name: '느긋한 일정', value: 'relaxed', description: '하루 평균 1~2개의 활동을 추천합니다.' },
        { name: '보통', value: 'normal', description: '하루 평균 3~4개의 활동을 추천합니다.' },
        { name: '꽉 찬 일정', value: 'packed', description: '하루 평균 5개 이상의 활동을 추천합니다.' }
    ];

    const selectedOptionDescription = speedOptions.find(opt => opt.value === selectedSpeed)?.description;

    const createNextStepUrl = () => {
        const params = new URLSearchParams();
        params.append('start', startDate || '');
        params.append('end', endDate || '');
        params.append('region', region || '');
        params.append('companion', companion || '');
        styles.forEach(style => params.append('style', style));
        params.append('speed', selectedSpeed);
        return `/planner/ai/transport?${params.toString()}`;
    };

    const createPreviousStepUrl = () => {
        const params = new URLSearchParams();
        params.append('start', startDate || '');
        params.append('end', endDate || '');
        params.append('region', region || '');
        params.append('companion', companion || '');
        styles.forEach(style => params.append('style', style));
        return `/planner/ai/style?${params.toString()}`;
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pt-24">
            <div className="w-full max-w-2xl text-center">
                <p className="text-blue-500 font-semibold mb-2">여행 스타일 선택 (4/5)</p>
                <h1 className="text-3xl font-bold mb-4">어떤 속도의 여행을 선호하시나요?</h1>

                <div className="my-12 p-8 bg-white border rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                        {speedOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedSpeed(option.value)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedSpeed === option.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <p className="font-semibold text-lg">선택된 여행 속도: <span className="text-blue-600">{speedOptions.find(opt => opt.value === selectedSpeed)?.name}</span></p>
                        <p className="text-gray-500 mt-2">{selectedOptionDescription}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <Link href={createPreviousStepUrl()} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={createNextStepUrl()}
                        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                    >
                        다음 단계
                    </Link>
                </div>
            </div>
        </div>
    );
}
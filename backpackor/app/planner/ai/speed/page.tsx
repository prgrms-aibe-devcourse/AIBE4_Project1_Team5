// app/planner/ai/speed/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 여행 속도 선택 페이지 컴포넌트
 */
export default function AiPlannerSpeedPage() {
    const searchParams = useSearchParams();
    const [selectedSpeed, setSelectedSpeed] = useState<string>('normal');

    // 다중 지역 및 스타일 정보를 배열로 받아옵니다.
    const regions = searchParams.getAll('region');
    const styles = searchParams.getAll('style');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const companion = searchParams.get('companion');

    const speedOptions = [
        { name: '느긋한 일정', value: 'relaxed', description: '하루 평균 1~2개의 활동을 추천합니다.' },
        { name: '보통', value: 'normal', description: '하루 평균 3~4개의 활동을 추천합니다.' },
        { name: '꽉 찬 일정', value: 'packed', description: '하루 평균 5개 이상의 활동을 추천합니다.' }
    ];

    const selectedOptionDescription = speedOptions.find(opt => opt.value === selectedSpeed)?.description;

    /**
     * @param isNext '다음 단계'로 갈 것인지 여부
     */
    const createUrl = (isNext: boolean) => {
        const params = new URLSearchParams();

        // 이전 단계들에서 받아온 모든 파라미터들을 추가합니다.
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        if (companion) params.append('companion', companion);
        regions.forEach(region => params.append('region', region)); // 모든 지역 추가
        styles.forEach(style => params.append('style', style)); // 모든 스타일 추가

        if (isNext) {
            // '다음 단계'일 경우, 현재 페이지에서 선택한 속도 정보를 추가합니다.
            params.append('speed', selectedSpeed);
            return `/planner/ai/transport?${params.toString()}`;
        } else {
            // '이전 단계'일 경우, 스타일 선택 페이지로 돌아갑니다.
            return `/planner/ai/style?${params.toString()}`;
        }
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
                    {/* 이전/다음 링크 모두 createUrl 함수를 사용하도록 변경 */}
                    <Link href={createUrl(false)} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={createUrl(true)}
                        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                    >
                        다음 단계
                    </Link>
                </div>
            </div>
        </div>
    );
}
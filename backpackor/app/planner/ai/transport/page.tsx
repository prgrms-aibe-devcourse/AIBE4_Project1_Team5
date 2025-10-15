// app/planner/ai/transport/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * AI 여행 계획 생성을 위한 이동수단 선택 페이지 컴포넌트입니다. (마지막 단계)
 */
export default function AiPlannerTransportPage() {
    const searchParams = useSearchParams();
    const [selectedTransport, setSelectedTransport] = useState<string[]>([]);

    // 다중 파라미터들을 배열로 받아옵니다.
    const regions = searchParams.getAll('region');
    const styles = searchParams.getAll('style');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const companion = searchParams.get('companion');
    const speed = searchParams.get('speed');

    const transportOptions = [
        { name: "자동차", value: "car" },
        { name: "자전거", value: "bicycle" },
        { name: "도보", value: "walk" },
        { name: "대중교통", value: "public_transport" },
        { name: "기차", value: "train" },
    ];

    const handleTransportClick = (transportValue: string) => {
        setSelectedTransport(prev =>
            prev.includes(transportValue)
                ? prev.filter(s => s !== transportValue)
                : [...prev, transportValue]
        );
    };

    /**
     * @param isNext '다음 단계'로 갈 것인지 여부
     */
    const createUrl = (isNext: boolean) => {
        const params = new URLSearchParams();

        // 이전 단계들에서 받아온 모든 파라미터들을 추가합니다.
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        if (companion) params.append('companion', companion);
        if (speed) params.append('speed', speed);
        regions.forEach(region => params.append('region', region));
        styles.forEach(style => params.append('style', style));

        if (isNext) {
            // '다음 단계'일 경우, 현재 페이지에서 선택한 이동수단 정보를 추가합니다.
            selectedTransport.forEach(transport => params.append('transport', transport));
            return `/planner/ai/loading?${params.toString()}`;
        } else {
            // '이전 단계'일 경우, 속도 선택 페이지로 돌아갑니다.
            return `/planner/ai/speed?${params.toString()}`;
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pt-24">
            <div className="w-full max-w-2xl text-center">
                <p className="text-blue-500 font-semibold mb-2">여행 스타일 선택 (5/5)</p>
                <h1 className="text-3xl font-bold mb-4">어떤 이동수단을 이용하실 건가요?</h1>
                <p className="text-gray-500">주요 이동수단을 모두 선택해주세요.</p>

                <div className="grid grid-cols-3 gap-4 my-8">
                    {transportOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleTransportClick(option.value)}
                            className={`p-6 bg-white border rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all ${selectedTransport.includes(option.value) ? 'border-blue-500 border-2' : ''}`}
                        >
                            <span className="text-lg">{option.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    {/* 이전/다음 링크 모두 createUrl 함수를 사용하도록 변경 */}
                    <Link href={createUrl(false)} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={selectedTransport.length > 0 ? createUrl(true) : '#'}
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 ${selectedTransport.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => { if (selectedTransport.length === 0) e.preventDefault(); }}
                    >
                        AI 추천 받기 ✨
                    </Link>
                </div>
            </div>
        </div>
    );
}
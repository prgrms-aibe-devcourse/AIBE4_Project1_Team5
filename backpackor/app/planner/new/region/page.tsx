// app/planner/new/region/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabaseClient';
import Link from 'next/link';

// Region 타입 정의
interface Region {
    region_id: number;
    region_name: string;
}

/**
 * 직접 여행 계획 생성을 위한 지역 선택 페이지 컴포넌트입니다.
 */
export default function RegionSelectPage() {
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    const [regions, setRegions] = useState<Region[]>([]); // DB에서 가져온 전체 지역 목록
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]); // 사용자가 선택한 지역 목록 (다중 선택)

    // 컴포넌트가 처음 렌더링될 때 Supabase에서 지역 목록을 가져옵니다.
    useEffect(() => {
        const fetchRegions = async () => {
            const { data, error } = await supabase
                .from('region')
                .select('*')
                .order('region_id', { ascending: true });

            if (data) {
                setRegions(data);
            } else if (error) {
                console.error("지역 정보 로딩 실패:", error);
                alert("지역 정보를 불러오는 데 실패했습니다.");
            }
            setIsLoading(false);
        };

        fetchRegions();
    }, []); // 빈 배열을 전달하여 한 번만 실행되도록 합니다.

    // 지역 버튼 클릭 시, 선택 목록에 추가하거나 제거하는 함수
    const handleSelectRegion = (regionName: string) => {
        setSelectedRegions(prev =>
            prev.includes(regionName)
                ? prev.filter(r => r !== regionName) // 이미 선택된 지역이면 배열에서 제거
                : [...prev, regionName] // 선택되지 않은 지역이면 배열에 추가
        );
    };

    // 이전, 다음 단계로 이동할 URL을 생성하는 함수
    const createUrl = (isNext: boolean) => {
        // 이전 페이지에서 받아온 날짜 정보를 가져옵니다.
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');
        const params = new URLSearchParams();

        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);

        if (isNext) {
            // '다음 단계'일 경우, 선택된 모든 지역 정보를 파라미터에 추가합니다.
            selectedRegions.forEach(region => params.append('region', region));
            return `/planner/edit?${params.toString()}`;
        } else {
            // '이전 단계'일 경우, 날짜 선택 페이지로 돌아갑니다.
            return `/planner/new`;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center pt-24">
            <div className="w-full max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-2">어디로 여행을 떠나시나요?</h1>
                <p className="text-gray-500 mb-8">여행하고 싶은 지역을 모두 선택해주세요.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {regions.map((region) => (
                        <button
                            key={region.region_id}
                            onClick={() => handleSelectRegion(region.region_name)}
                            // 선택된 지역인지 확인하여 다른 스타일을 적용합니다.
                            className={`px-6 py-3 bg-white border rounded-lg text-gray-700 font-semibold hover:border-blue-500 transition-colors duration-200 shadow-sm ${selectedRegions.includes(region.region_name) ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                        >
                            {region.region_name}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-2xl mx-auto mt-10 flex justify-between items-center">
                    <Link href={createUrl(false)} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={createUrl(true)}
                        // 선택된 지역이 하나도 없으면 버튼을 비활성화합니다.
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 ${selectedRegions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => { if (selectedRegions.length === 0) e.preventDefault(); }}
                    >
                        일정 만들러 가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
// app/planner/ai/region/page.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabaseClient';
import Link from 'next/link'; // Import Link component

interface Region {
    region_id: number;
    region_name: string;
}

export default function RegionSelectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createBrowserClient();

    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

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
    }, []);

    const handleSelectRegion = (regionName: string) => {
        setSelectedRegion(regionName);
    };

    const nextStepUrl = selectedRegion
        ? `/planner/ai/companion?${searchParams.toString()}&region=${selectedRegion}`
        : '#';

    const previousStepUrl = `/planner/ai?${searchParams.toString()}`;

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">지역 정보를 불러오는 중...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-4xl text-center">
                <p className="text-blue-500 font-semibold mb-2">여행 스타일 선택 (2/5)</p>
                <h1 className="text-4xl font-bold mb-10 text-gray-800">어디로 여행을 떠나시나요?</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {regions.map((region) => (
                        <button
                            key={region.region_id}
                            onClick={() => handleSelectRegion(region.region_name)}
                            className={`px-6 py-3 bg-white border rounded-lg text-gray-700 font-semibold hover:border-blue-500 transition-colors duration-200 shadow-sm ${selectedRegion === region.region_name ? 'border-blue-500 border-2' : 'border-gray-200'}`}
                        >
                            {region.region_name}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-2xl mx-auto mt-10 flex justify-between items-center">
                    <Link href={previousStepUrl} className="px-6 py-3 text-gray-600 font-semibold rounded-lg hover:bg-gray-200">
                        이전 단계
                    </Link>
                    <Link
                        href={nextStepUrl}
                        className={`px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 ${!selectedRegion ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => { if (!selectedRegion) e.preventDefault(); }}
                    >
                        다음 단계
                    </Link>
                </div>
            </div>
        </div>
    );
}
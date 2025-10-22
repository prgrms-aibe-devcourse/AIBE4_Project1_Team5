// app/planner/ai/loading/page.tsx
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * AI 추천 생성을 위해 백엔드 API를 호출하고 대기하는 로딩 페이지입니다.
 */
function AiLoadingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(10);

    // API 요청이 이미 시작되었는지 추적하기 위한 '플래그'
    const isFetching = useRef(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const randomIncrement = Math.random() * 6 + 4;
            setProgress(prev => (prev < 90 ? prev + randomIncrement : prev));
        }, 1500);

        const generatePlan = async () => {
            try {
                // 1. 백엔드 API에 모든 파라미터를 그대로 넘겨 요청을 보냅니다.
                const response = await fetch(`/apis/planner?${searchParams.toString()}`);
                if (!response.ok) {
                    throw new Error('AI 추천 생성에 실패했습니다.');
                }
                const data = await response.json();

                // 2. 응답이 오면 로딩을 완료 처리합니다.
                clearInterval(timer);
                setProgress(100);

                // --- 편집 페이지로 이동 ---
                setTimeout(() => {
                    const params = new URLSearchParams();
                    params.append('start', searchParams.get('start') || '');
                    params.append('end', searchParams.get('end') || '');
                    params.append('aiPlan', JSON.stringify(data.plan));
                    params.append('aiTitle', data.title || 'AI 추천 여행');

                    const regionNames = searchParams.getAll('region');
                    regionNames.forEach(region => params.append('region', region));

                    const regionIds = searchParams.getAll('region_id');
                    regionIds.forEach(id => params.append('region_id', id));

                    router.push(`/planner/edit?${params.toString()}`);
                }, 500);

            } catch (error) {
                console.error(error);
                alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                router.back();
            }
        };

        // 아직 API 요청을 보낸 적이 없을 때만 generatePlan 함수를 실행합니다.
        if (!isFetching.current) {
            isFetching.current = true;
            generatePlan();
        }

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
                AI가 최적의 여행 코스를 만들고 있어요!
            </h2>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-800 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-600">{Math.round(progress)}%</p>
            <p className="mt-2 text-sm text-gray-500">
                잠시만 기다려주세요...
            </p>
        </div>
    );
}

export default function AiLoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AiLoadingContent />
    </Suspense>
  );
}
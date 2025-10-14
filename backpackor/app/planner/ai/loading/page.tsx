// app/planner/ai/loading/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * AI 추천 생성을 위해 백엔드 API를 호출하고 대기하는 로딩 페이지입니다.
 */
export default function AiLoadingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(10); // 프로그레스 바의 진행률 상태

    // 페이지가 로드될 한 번만 실행됩니다.
    useEffect(() => {
        const timer = setInterval(() => {
            const randomIncrement = Math.random() * 6 + 4;
            setProgress(prev => (prev < 90 ? prev + randomIncrement : prev));
        }, 800);

        const generatePlan = async () => {
            try {
                // 1. 백엔드 API(/api/generate-plan)에 요청을 보냅니다.
                // searchParams를 그대로 넘겨주면 모든 정보가 함께 전달됩니다.
                const response = await fetch(`/api/generate-plan?${searchParams.toString()}`);
                if (!response.ok) {
                    throw new Error('AI 추천 생성에 실패했습니다.');
                }
                const data = await response.json();
                // 2. API 응답이 오면 타이머를 멈추고 프로그레스 바를 100%로 만듭니다.
                clearInterval(timer);
                setProgress(100);
                // 3. 잠시 후 응답받은 데이터를 가지고 편집 페이지로 이동합니다.
                setTimeout(() => {
                    const params = new URLSearchParams({
                        start: searchParams.get('start') || '',
                        end: searchParams.get('end') || '',
                        aiPlan: JSON.stringify(data.plan),
                        aiTitle: data.title || 'AI 추천 여행'
                    });
                    router.push(`/planner/edit?${params.toString()}`);
                }, 500);

            } catch (error) {
                console.error(error);
                alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                // 오류 발생 시 이전 페이지로 돌려보냅니다.
                router.back();
            }
        };
        generatePlan(); // 함수 실행

        // 컴포넌트가 언마운트될 때 타이머를 정리합니다.
        return () => clearInterval(timer);
    }, []); // 빈 배열을 전달하여 최초 렌더링 시에만 실행되도록 함

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
                AI가 최적의 여행 코스를 만들고 있어요!
            </h2>

            {/* 프로그레스 바 UI */}
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
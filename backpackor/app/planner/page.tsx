// app/planner/page.tsx

import Link from 'next/link'; // Link 컴포넌트를 import 합니다.

/**
 * 여행 계획 생성 방식을 선택하는 페이지 컴포넌트입니다.
 * (AI 추천 / 직접 생성)
 */
export default function PlannerStartPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50">
            <h1 className="text-4xl font-bold mb-4">어떤 여행을 계획하고 싶으신가요?</h1>
            <p className="text-gray-600 mb-12">두 가지 방법으로 당신만의 완벽한 여행을 만들 수 있습니다.</p>

            <div className="flex gap-8 w-full max-w-4xl">

                {/* 1. AI로 계획 짜기 카드 - 클릭 시 /planner/ai 로 이동 */}
                <Link href="/planner/ai" className="flex-1">
                    <div className="p-8 h-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-all">
                        <h2 className="text-2xl font-semibold mb-2">AI로 똑똑하게 여행 계획 짜기 🤖</h2>
                        <p className="text-gray-500">
                            몇 가지 질문에 답하면, AI가 당신의 취향에 꼭 맞는 여행 코스를 추천해 드립니다.
                        </p>
                    </div>
                </Link>

                {/* 2. 직접 계획 짜기 카드 - 클릭 시 /planner/new 로 이동 */}
                <Link href="/planner/new" className="flex-1">
                    <div className="p-8 h-full bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-all">
                        <h2 className="text-2xl font-semibold mb-2">처음부터 직접 여행 계획 짜기 ✏️</h2>
                        <p className="text-gray-500">
                            가고 싶은 곳들을 자유롭게 담아 나만의 여행 일정을 직접 만들어 보세요.
                        </p>
                    </div>
                </Link>

            </div>
        </div>
    );
}
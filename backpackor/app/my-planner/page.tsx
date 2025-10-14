// app/my-planner/page.tsx '내 일정' 목록 페이지로, 서버에서 사용자의 전체 여행 계획 데이터를 불러오는 역할

import PlanList from "@/component/my-planner/PlanList"; // 클라이언트 컴포넌트인 PlanList를 import 합니다.
import { createServerClient } from "@/lib/supabaseClient";
import Link from "next/link";

// trip_plan 테이블의 데이터 타입을 정의합니다.
interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
  created_at: string;
}

// 이 페이지가 받을 searchParams의 타입을 정의합니다.
interface MyPageProps {
  searchParams: {
    sort?: "asc" | "desc";
  };
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const supabase = createServerClient();

  // URL 쿼리에 따라 정렬 순서를 결정합니다.
  const sortOrder = searchParams.sort === "asc" ? "created_at" : "created_at";
  const isAscending = searchParams.sort === "asc";

  // Supabase에서 데이터를 불러옵니다.
  const { data: plans, error } = await supabase
    .from("trip_plan")
    .select("*")
    .order(sortOrder, { ascending: isAscending });

  // 데이터 로딩 중 에러가 발생하면 에러 메시지를 보여줍니다.
  if (error) {
    console.error("데이터 로딩 실패:", error);
    return <div>일정을 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">내 일정</h1>
          <p className="text-gray-500">나의 여행 계획들을 관리해보세요.</p>
        </div>
        <Link
          href="/planner"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          + 새 일정 만들기
        </Link>
      </header>

      <div className="flex items-center gap-4 mb-4">
        <p className="font-semibold">필터:</p>
        <Link
          href="/my-planner?sort=desc"
          className={`px-3 py-1 rounded-full text-sm ${
            !isAscending ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          최신순
        </Link>
        <Link
          href="/my-planner?sort=asc"
          className={`px-3 py-1 rounded-full text-sm ${
            isAscending ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          오래된순
        </Link>
      </div>

      {/* 실제 목록 UI는 PlanList 컴포넌트에 데이터를 넘겨서 그리도록 합니다. */}
      <PlanList initialPlans={plans || []} />
    </div>
  );
}

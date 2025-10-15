"use client";

import PlanList from "@/component/my-planner/PlanList";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
  created_at: string;
}

export default function MyPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 로그인 상태 확인 및 리다이렉트 처리
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const redirectPath = encodeURIComponent("/my-planner");
        router.replace(`/login?redirect=${redirectPath}`);
        return;
      }

      setUser(user);
    };

    checkAuth();
  }, [router]);

  // 로그인된 경우 trip_plan 데이터 불러오기
  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      try {
        const sortOrder =
          searchParams.get("sort") === "asc" ? "created_at" : "created_at";
        const isAscending = searchParams.get("sort") === "asc";

        const { data, error } = await supabase
          .from("trip_plan")
          .select("*")
          .eq("user_id", user.id)
          .order(sortOrder, { ascending: isAscending });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user, searchParams]);

  if (loading) return <p className="text-center mt-20">불러오는 중...</p>;

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
            !searchParams.get("sort") || searchParams.get("sort") === "desc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          최신순
        </Link>
        <Link
          href="/my-planner?sort=asc"
          className={`px-3 py-1 rounded-full text-sm ${
            searchParams.get("sort") === "asc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          오래된순
        </Link>
      </div>

      <PlanList initialPlans={plans || []} />
    </div>
  );
}

"use client";

import PlanList from "@/component/my-planner/PlanList";
import { useAuth } from "@/hook/useAuth";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true); // 초기값 true로 변경

  // searchParams에서 정렬 값만 추출 (깜박임 방지)
  const sortOrder = useMemo(
    () => searchParams.get("sort") || "desc",
    [searchParams]
  );

  // 인증 상태 확인 및 리다이렉트 처리
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const redirectPath = encodeURIComponent("/my-planner");
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [user, authLoading, router]);

  // 로그인된 경우 trip_plan 데이터 불러오기
  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const isAscending = sortOrder === "asc";

        const { data, error } = await supabase
          .from("trip_plan")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: isAscending });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [user, sortOrder]);

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>

          {/* 필터 스켈레톤 */}
          <div className="flex gap-3">
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          </div>

          {/* 목록 스켈레톤 */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
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
            sortOrder === "desc" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          최신순
        </Link>
        <Link
          href="/my-planner?sort=asc"
          className={`px-3 py-1 rounded-full text-sm ${
            sortOrder === "asc" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          오래된순
        </Link>
      </div>

      {plansLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <PlanList initialPlans={plans || []} />
      )}
    </div>
  );
}

"use client";

import PlanList from "@/components/my-planner/PlanList";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

interface TripPlan {
  trip_id: number;
  trip_title: string;
  trip_start_date: string;
  trip_end_date: string;
  created_at: string;
}

function MyPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const sortOrder = useMemo(
    () => searchParams.get("sort") || "desc",
    [searchParams]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const redirectPath = encodeURIComponent("/my-planner");
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [user, authLoading, router]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-6 sm:p-8 max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* 헤더 스켈레톤 */}
            <div className="space-y-4">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-48 animate-pulse" />
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 animate-pulse" />
            </div>

            {/* 필터 스켈레톤 */}
            <div className="flex flex-wrap gap-3">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24 animate-pulse" />
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24 animate-pulse" />
            </div>

            {/* 목록 스켈레톤 */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                내 여행 일정
              </h1>
              <p className="text-gray-600 text-lg">
                나만의 특별한 여행 계획을 관리하세요
              </p>
            </div>
            <Link
              href="/planner"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl mr-2">+</span>새 일정 만들기
            </Link>
          </div>
        </header>

        {/* 필터 */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-700 font-semibold text-sm">정렬:</span>
            <Link
              href="/my-planner?sort=desc"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                sortOrder === "desc"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              최신순
            </Link>
            <Link
              href="/my-planner?sort=asc"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                sortOrder === "asc"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              오래된순
            </Link>
          </div>
        </div>

        {/* 일정 목록 */}
        {plansLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              아직 여행 계획이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 여행 계획을 만들어보세요!
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl mr-2">+</span>새 일정 만들기
            </Link>
          </div>
        ) : (
          <PlanList initialPlans={plans} />
        )}
      </div>
    </div>
  );
}

export default function MyPlannerPage() {
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
      <MyPlannerContent />
    </Suspense>
  );
}

"use client";

import TravelCard from "@/component/place/TravelCard";
import { useAuth } from "@/hook/useAuth";
import { useProfile } from "@/hook/useProfile";
import { createBrowserClient } from "@/lib/supabaseClient";
import type { TravelSummary } from "@/type/travel";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const [popularPlaces, setPopularPlaces] = useState<TravelSummary[]>([]);
  const [bestPlaces, setBestPlaces] = useState<TravelSummary[]>([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      const supabase = createBrowserClient();

      const { data: popularData } = await supabase
        .from("place")
        .select("place_id, place_name, place_image, average_rating")
        .order("favorite_count", { ascending: false })
        .limit(3);

      const { data: bestData } = await supabase
        .rpc("get_places_with_details")
        .order("average_rating", { ascending: false })
        .limit(3);

      setPopularPlaces(popularData || []);
      setBestPlaces(bestData || []);
    };

    fetchPlaces();
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out both;
        }
      `}</style>
      <main className="min-h-screen bg-white">
        {/* ✅ Hero Section */}
        <section className="relative h-[60vh] min-h-[520px] overflow-hidden">
          {/* 배경 이미지 (맨 뒤) */}
          <img
            src="https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/banner/1.jpg"
            alt="여행 배너"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/30 via-blue-300/20 to-blue-200/30 z-10"></div>

          {/* 텍스트 */}
          <div className="relative z-20 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
              {user ? (
                <>
                  <h1 className="text-white text-8xl md:text-9xl font-extrabold tracking-tight drop-shadow-2xl animate-fade-in-up leading-tight">
                    안녕하세요,
                    <br />
                    <span className="text-sky-700 font-semibold">
                      {profile?.display_name || "사용자"}
                    </span>
                    님!
                  </h1>
                  <p className="text-white/95 text-4xl font-medium drop-shadow-xl leading-relaxed animate-fade-in-up">
                    오늘은 어떤 여행을 꿈꾸시나요?
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-white text-8xl md:text-9xl font-extrabold tracking-tight drop-shadow-2xl animate-fade-in-up leading-tight">
                    어디로 떠나볼까요?
                  </h1>
                  <p className="text-white/90 text-4xl font-normal drop-shadow-xl leading-relaxed animate-fade-in-up">
                    새로운 여행지를 발견하고
                    <br />
                    잊지 못할 추억을 만들어보세요
                  </p>
                </>
              )}

              {/* CTA 버튼 */}
              <div className="flex justify-center pt-6 animate-fade-in-up">
                <Link
                  href="/place"
                  className="group inline-flex items-center gap-2 px-10 py-4 bg-white/95 text-blue-600 font-bold rounded-full text-xl hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/40"
                >
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  여행지 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 🔥 인기 여행지 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            {/* 🔹 영어 서브타이틀 */}
            <p className="text-blue-600 font-semibold text-lg tracking-widest mb-3">
              HOT PLACE
            </p>

            {/* 🔸 메인 타이틀 */}
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              지금 가장 인기있는 여행지
            </h2>

            <p className="text-xl text-gray-600">
              많은 여행자들이 선택한 베스트 여행지를 만나보세요
            </p>
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularPlaces.map((place, index) => (
              <div
                key={place.place_id}
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                <TravelCard place={place} />
              </div>
            ))}
          </div>
        </section>

        {/* ⭐ 베스트 여행지 */}
        <section className="bg-gradient-to-b from-blue-50 via-sky-50 to-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              {/* 🔹 영어 서브타이틀 */}
              <p className="text-yellow-500 font-semibold text-lg tracking-widest mb-3">
                BEST RATED
              </p>

              {/* 🔸 메인 타이틀 */}
              <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                별점이 높은 여행지
              </h2>

              <p className="text-xl text-gray-600">
                실제 방문객들이 극찬한 최고의 여행지
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestPlaces.map((place, index) => (
                <div
                  key={place.place_id}
                  className="transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                  }}
                >
                  <TravelCard place={place} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ Footer CTA (일정 계획하기 유도) */}
        <section className="relative bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-extrabold mb-8 leading-tight">
              지금 바로 여행 계획을 시작하세요
            </h2>
            <p className="text-2xl text-blue-50 mb-12">
              간단한 클릭만으로 완벽한 여행 일정을 만들 수 있습니다
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-3 px-12 py-5 bg-white text-blue-600 font-bold rounded-full text-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span>나만의 여행 만들기</span>
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

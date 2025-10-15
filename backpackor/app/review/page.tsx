"use client";

import { useAuth } from "@/hook/useAuth";
import { getReviews, toggleLike, type Review } from "@/lib/reviewStore";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Heart, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showPhotoOnly, setShowPhotoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    "latest" | "likes" | "rating-high" | "rating-low"
  >("latest");

  // 로그인 확인 및 초기 데이터 로드
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?redirect=/review");
      return;
    }

    const init = async () => {
      try {
        setReviewsLoading(true);

        const { data: regionData, error } = await supabase
          .from("region")
          .select("region_name")
          .order("region_name", { ascending: true });

        if (!error && regionData) {
          const names = regionData.map((r) => r.region_name);
          setRegions(["전체", ...names]);
        }

        loadReviews();
      } catch (err) {
        console.error("초기화 오류:", err);
        loadReviews();
      } finally {
        setReviewsLoading(false);
      }
    };

    const loadReviews = () => {
      const stored = getReviews();
      const migrated = stored.map((r) => ({
        ...r,
        region: r.region || "기타",
        likes: r.likes || 0,
        likedBy: r.likedBy || [],
      }));
      setReviews(migrated);
      setFilteredReviews(migrated);
    };

    init();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "travel-reviews") loadReviews();
    };
    const handleFocus = () => loadReviews();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [authLoading, user, router]);

  // 필터 및 정렬 적용
  useEffect(() => {
    let filtered = [...reviews];

    if (selectedRegion !== "전체") {
      filtered = filtered.filter(
        (r) => (r.region || "기타") === selectedRegion
      );
    }

    if (showPhotoOnly) {
      filtered = filtered.filter((r) => r.images && r.images.length > 0);
    }

    switch (sortBy) {
      case "latest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "likes":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "rating-high":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, selectedRegion, showPhotoOnly, sortBy]);

  const handleLike = (reviewId: string) => {
    if (!user) {
      router.push("/login?redirect=/review");
      return;
    }

    const updated = toggleLike(reviewId, user.id);
    if (updated) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    }
  };

  const hasUserLiked = (r: Review): boolean =>
    r.likedBy?.includes(user?.id ?? "") || false;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i + 1 <= Math.floor(rating);
      const half = i + 1 === Math.ceil(rating) && rating % 1 !== 0;
      return (
        <Star
          key={i}
          size={20}
          className={`${
            filled || half ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } inline-block`}
        />
      );
    });
  };

  const averageRating =
    filteredReviews.length === 0
      ? 0
      : (
          filteredReviews.reduce((acc, r) => acc + r.rating, 0) /
          filteredReviews.length
        ).toFixed(1);

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 헤더 스켈레톤 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-4 mb-6">
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-64 animate-pulse" />
            </div>

            {/* 통계 스켈레톤 */}
            <div className="flex gap-8 pt-6 border-t border-gray-200">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* 필터 스켈레톤 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse" />
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 리뷰 목록 스켈레톤 */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-3"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <button
                onClick={() => router.push("/")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                홈으로
              </button>
              <h1 className="text-4xl font-bold mt-3">여행 리뷰</h1>
              <p className="text-gray-600">
                다른 여행자들의 생생한 후기를 확인하세요
              </p>
            </div>
            <Link
              href="/review/write"
              className="btn-primary shadow-md hover:shadow-lg transition-all"
            >
              리뷰 작성하기
            </Link>
          </div>

          {/* 통계 */}
          <div className="flex gap-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {averageRating}
              </div>
              <div className="text-sm text-gray-600 mt-1">평균 평점</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {filteredReviews.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">리뷰 수</div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">필터</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  지역별:
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white hover:bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  정렬:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white hover:bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="latest">최신순</option>
                  <option value="likes">좋아요순</option>
                  <option value="rating-high">평점 높은순</option>
                  <option value="rating-low">평점 낮은순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 포토리뷰만 보기 */}
          <button
            onClick={() => setShowPhotoOnly(!showPhotoOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              showPhotoOnly
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Camera size={20} />
            포토리뷰만 보기
          </button>
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg p-6 space-y-3"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                조건에 맞는 리뷰가 없습니다
              </h3>
              <p className="text-gray-500 mb-6">다른 필터를 선택해보세요</p>
              <Link
                href="/review/write"
                className="btn-outline shadow-sm hover:shadow-md transition-all"
              >
                리뷰 작성하기
              </Link>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{review.title}</h3>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {review.placeName}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {review.region || "기타"}
                      </span>
                      {review.images?.length > 0 && (
                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Camera size={14} /> 포토리뷰
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-semibold text-gray-700">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{review.author}</span>
                      <span>•</span>
                      <span>{review.createdAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLike(review.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                      hasUserLiked(review) ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      size={24}
                      className={`${
                        hasUserLiked(review)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      } transition-all`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        hasUserLiked(review) ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {review.likes || 0}
                    </span>
                  </button>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  {review.content}
                </p>

                {review.images?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={image}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

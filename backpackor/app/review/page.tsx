"use client";

import { useAuth } from "@/hook/useAuth";
import { getReviews, toggleLike, type Review } from "@/lib/reviewStore";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Heart, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewListPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<ReviewWithImages[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);

  // 리뷰 목록 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      
      let data: ReviewWithImages[];
      if (selectedRegion === '전체') {
        data = await getReviews();
      } else {
        data = await getReviewsByRegion(selectedRegion);
      }
      
      setReviews(data);
      setIsLoading(false);
    };

    fetchReviews();
  }, [selectedRegion]);

  // 리뷰 삭제
  const handleDelete = async (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      // 삭제 후 목록 갱신
      setReviews(reviews.filter(review => review.review_id !== reviewId));
      alert('리뷰가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 리뷰 수정
  const handleEdit = (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    router.push(`/review/edit/${reviewId}`);
  };
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

  // 별점 렌더링
  const renderStars = (rating: number) => {
<<<<<<< HEAD
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.min(Math.max((rating - (i - 1)) * 100, 0), 100);
      
      stars.push(
        <span key={i} className="relative inline-block text-yellow-400 text-xl">
          <span className="text-gray-300">★</span>
          <span 
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            ★
          </span>
        </span>
=======
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
>>>>>>> 957e5eaa604b4bd516b2aa2c1826558b7dc2b836
      );
    });
  };

<<<<<<< HEAD
  // 전체 리뷰 통계 계산
  const calculateStats = () => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {} as Record<string, number>
      };
    }

    const ratingCounts: Record<string, number> = {};
    // 0.5 단위로 초기화
    for (let i = 5; i >= 0.5; i -= 0.5) {
      ratingCounts[i.toFixed(1)] = 0;
    }

    let totalRating = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      // 0.5 단위로 반올림
      const roundedRating = (Math.round(review.rating * 2) / 2).toFixed(1);
      if (ratingCounts[roundedRating] !== undefined) {
        ratingCounts[roundedRating]++;
      }
    });

    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingCounts
    };
  };

  const stats = calculateStats();

  // 날짜 포맷팅 (시간 포함)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
=======
  const averageRating =
    filteredReviews.length === 0
      ? 0
      : (
          filteredReviews.reduce((acc, r) => acc + r.rating, 0) /
          filteredReviews.length
        ).toFixed(1);
>>>>>>> 957e5eaa604b4bd516b2aa2c1826558b7dc2b836

  // 인증 로딩 중
  if (authLoading) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
=======
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
>>>>>>> 957e5eaa604b4bd516b2aa2c1826558b7dc2b836
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">여행 리뷰</h1>
        {user && <WriteButton />}
      </div>

      {/* 지역 필터 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">지역별 필터</h2>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

     {/* 통계 */}
      <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 평균 평점 */}
          <div className="flex flex-col items-center justify-center md:w-1/3 border-r border-gray-200 pr-8">
            <p className="text-7xl text-gray-500 mb-3">평균 평점</p>
            <p className="text-7xl font-bold text-gray-900 mb-3">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((position) => {
                const fillPercentage = Math.min(Math.max((stats.averageRating - (position - 1)) * 100, 0), 100);
                return (
                  <span key={position} className="relative inline-block text-yellow-400 text-3xl">
                    <span className="text-gray-300">★</span>
                    <span 
                      className="absolute left-0 top-0 overflow-hidden"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      ★
                    </span>
                  </span>
                );
              })}
            </div>
            <p className="text-base text-gray-500">
              총 리뷰 수 <span className="font-semibold text-gray-700 text-lg">{stats.totalReviews}</span>개
            </p>
          </div>

          {/* 별점 분포 */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-semibold mb-4">별점 분포</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from({ length: 10 }, (_, i) => (5 - i * 0.5).toFixed(1)).map((rating) => {
                const count = stats.ratingCounts[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-10">{rating}점</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-50 text-middle">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedRegion === '전체' 
              ? '아직 작성된 리뷰가 없습니다.' 
              : `${selectedRegion} 지역에 작성된 리뷰가 없습니다.`}
          </p>
          {user && (
            <WriteButton className="mt-4" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              onClick={() => router.push(`/review/${review.review_id}`)}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
            >
              {/* 썸네일 이미지 */}
              {review.images.length > 0 ? (
                <div className="w-full h-48 bg-gray-200">
                  <img
                    src={review.images[0].review_image}
                    alt={review.review_title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">이미지 없음</span>
                </div>
              )}

              {/* 내용 */}
              <div className="p-4">
                {/* 지역 뱃지 */}
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {review.region}
                  </span>
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                  {review.review_title}
                </h3>

                {/* 별점 */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                {/* 내용 미리보기 */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {review.review_content}
                </p>

                {/* 날짜 정보 */}
                <div className="flex flex-col gap-1 mb-2">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">작성:</span> {formatDate(review.created_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">수정:</span> {formatDate(review.updated_at || review.created_at)}
                    {review.updated_at && review.updated_at !== review.created_at && (
                      <span className="ml-1 text-orange-600">(수정됨)</span>
                    )}
                  </p>
                </div>

                {/* 본인 리뷰인 경우에만 수정/삭제 버튼 표시 */}
                {user && user.id === review.user_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEdit(review.review_id, e)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => handleDelete(review.review_id, e)}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
=======
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
>>>>>>> 957e5eaa604b4bd516b2aa2c1826558b7dc2b836
    </div>
  );
}

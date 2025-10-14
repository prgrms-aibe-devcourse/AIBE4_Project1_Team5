'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getReviews, toggleLike, type Review } from '@/lib/reviewStore';
import { Star, Heart, Camera } from 'lucide-react';

const REGIONS = [
  "전체",
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

export default function ReviewPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showPhotoOnly, setShowPhotoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'likes' | 'rating-high' | 'rating-low'>('latest');
  const [currentUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Date.now()}`;
        localStorage.setItem('userId', userId);
      }
      return userId;
    }
    return 'user_default';
  });

  // 리뷰 불러오기 + 데이터 마이그레이션
  useEffect(() => {
    const loadReviews = () => {
      const storedReviews = getReviews();
      
      // 기존 리뷰 데이터에 새 속성 추가 (마이그레이션)
      const migratedReviews = storedReviews.map(review => ({
        ...review,
        region: review.region || '기타',
        likes: review.likes || 0,
        likedBy: review.likedBy || [],
      }));
      
      setReviews(migratedReviews);
      setFilteredReviews(migratedReviews);
      setIsLoading(false);
    };

    loadReviews();

    // 스토리지 변경 감지 (다른 탭에서 리뷰 추가 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'travel-reviews') {
        loadReviews();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 페이지 포커스 시 리뷰 새로고침
    const handleFocus = () => {
      loadReviews();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 필터링 및 정렬 적용
  useEffect(() => {
    let filtered = [...reviews];

    // 지역 필터
    if (selectedRegion !== "전체") {
      filtered = filtered.filter(review => (review.region || '기타') === selectedRegion);
    }

    // 포토리뷰 필터
    if (showPhotoOnly) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    // 정렬
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'likes':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, selectedRegion, showPhotoOnly, sortBy]);

  const handleLike = (reviewId: string) => {
    const updatedReview = toggleLike(reviewId, currentUserId);
    if (updatedReview) {
      // 상태 업데이트
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
    }
  };

  const hasUserLiked = (review: Review): boolean => {
    // 안전하게 체크 (기존 데이터 호환)
    return review.likedBy?.includes(currentUserId) || false;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rating);
      const isHalfFilled = i === Math.ceil(rating) && rating % 1 !== 0;
      
      stars.push(
        <Star
          key={i}
          size={20}
          className={`${
            isFilled || isHalfFilled
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } inline-block`}
        />
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => router.push('/')}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                  >
                    ← 홈으로
                  </button>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  여행 리뷰
                </h1>
                <p className="text-gray-600">
                  다른 여행자들의 생생한 후기를 확인하세요
                </p>
              </div>
              <Link
                href="/review/write"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-xl">✍️</span>
                리뷰 작성하기
              </Link>
            </div>

            {/* 통계 정보 */}
            <div className="flex gap-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {calculateAverageRating()}
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

          {/* 필터 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">필터</h3>
              
              {/* 정렬 및 지역 필터 */}
              <div className="flex items-center gap-4">
                {/* 지역 필터 드롭다운 */}
                <div className="flex items-center gap-2">
                  <label htmlFor="region" className="text-sm font-semibold text-gray-700">
                    지역별:
                  </label>
                  <select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white hover:bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 정렬 드롭다운 */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-semibold text-gray-700">
                    정렬:
                  </label>
                  <select
                    id="sort"
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
            
            {/* 포토리뷰만 보기 토글 */}
            <div>
              <button
                onClick={() => setShowPhotoOnly(!showPhotoOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  showPhotoOnly
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera size={20} />
                포토리뷰만 보기
              </button>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {showPhotoOnly || selectedRegion !== "전체" 
                    ? "조건에 맞는 리뷰가 없습니다"
                    : "아직 등록된 리뷰가 없습니다"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {showPhotoOnly || selectedRegion !== "전체"
                    ? "다른 필터를 선택해보세요"
                    : "첫 번째 리뷰를 작성해보세요!"}
                </p>
                {!(showPhotoOnly || selectedRegion !== "전체") && (
                  <Link
                    href="/review/write"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all inline-block"
                  >
                    리뷰 작성하기
                  </Link>
                )}
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  {/* 리뷰 헤더 */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-800">
                          {review.title}
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {review.placeName}
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {review.region || '기타'}
                        </span>
                        {review.images && review.images.length > 0 && (
                          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Camera size={14} />
                            포토리뷰
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
                    
                    {/* 좋아요 버튼 */}
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                        hasUserLiked(review)
                          ? 'bg-red-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Heart
                        size={24}
                        className={`${
                          hasUserLiked(review)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        } transition-all`}
                      />
                      <span className={`text-xs font-semibold ${
                        hasUserLiked(review) ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {review.likes || 0}
                      </span>
                    </button>
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {review.content}
                  </p>

                  {/* 이미지 갤러리 */}
                  {review.images && review.images.length > 0 && (
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
    </>
  );
}
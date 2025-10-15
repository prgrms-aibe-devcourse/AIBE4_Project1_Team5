// app/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReviews, getReviewsByRegion, deleteReview, type ReviewWithImages } from '@/lib/reviewStoreSupabase';
import { useAuth } from '@/hook/useAuth';
import { WriteButton } from '@/component/review/ReviewButton';

const REGIONS = [
  '전체',
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
];

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

  // 별점 렌더링
  const renderStars = (rating: number) => {
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
      );
    }
    return stars;
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
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
    </div>
  );
}
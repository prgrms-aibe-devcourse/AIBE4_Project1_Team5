// app/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReviews, getReviewsByRegion, deleteReview, getRegions, type ReviewWithImages } from '@/lib/reviewStoreSupabase';
import { useAuth } from '@/hook/useAuth';
import { useProfile } from '@/hook/useProfile';
import { WriteButton, ReviewActionButtons } from '@/component/review/ReviewButton';
import Sort from '@/component/review/ReviewSort';
import { supabase } from '@/lib/supabaseClient';

// 개별 리뷰 카드 컴포넌트 (닉네임 + 여행지명 표시)
function ReviewCard({ review, user, onEdit, onDelete }: {
  review: ReviewWithImages;
  user: any;
  onEdit: (reviewId: string, e: React.MouseEvent) => void;
  onDelete: (reviewId: string) => void;
}) {
  const router = useRouter();
  const { profile } = useProfile(review.user_id);
  const [placeName, setPlaceName] = useState<string>('');

  // 여행지 이름 가져오기
  useEffect(() => {
    const fetchPlaceName = async () => {
      if (review.place_id) {
        const { data, error } = await supabase
          .from('place')
          .select('place_name')
          .eq('place_id', review.place_id)
          .single();

        if (!error && data) {
          setPlaceName(data.place_name);
        }
      }
    };

    fetchPlaceName();
  }, [review.place_id]);

  // 별점 렌더링 (정수만)
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // 날짜 포맷팅
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

  return (
    <div
      onClick={() => router.push(`/review/detail/${review.review_id}`)}
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      {/* 썸네일 이미지 */}
      {review.images.length > 0 ? (
        <div className="w-full h-48 bg-gray-200 relative">
          <img
            src={review.images[0].review_image}
            alt={review.review_title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('이미지 로드 실패:', review.images[0].review_image);
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-gray-400">이미지 로드 실패</span></div>';
              }
            }}
          />
          {/* 이미지 개수 표시 */}
          {review.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              📷 {review.images.length}
            </div>
          )}
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

        {/* 여행지명 표시 */}
        {placeName && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">📍 여행지:</span> {placeName}
            </p>
          </div>
        )}

        {/* 제목 */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">
          {review.review_title}
        </h3>

        {/* 별점 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* 내용 미리보기 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {review.review_content}
        </p>

        {/* 작성자 정보 */}
        <div className="mb-3 pb-3 border-b border-gray-100">
          <p className="text-sm text-gray-700">
            <span className="font-medium">작성자:</span> {profile?.display_name || '익명 사용자'}
          </p>
        </div>

        {/* 날짜 정보 */}
        <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium">작성:</span> {formatDate(review.created_at)}
          </p>
          {review.updated_at && review.updated_at !== review.created_at && (
            <p className="text-xs text-orange-600">
              <span className="font-medium">수정됨:</span> {formatDate(review.updated_at)}
            </p>
          )}
        </div>

        {/* 본인 리뷰인 경우에만 수정/삭제 버튼 표시 */}
        {user && user.id === review.user_id && (
          <ReviewActionButtons
            reviewId={review.review_id}
            onEdit={(e) => onEdit(review.review_id, e)}
            onDelete={() => onDelete(review.review_id)}
          />
        )}
      </div>
    </div>
  );
}

export default function ReviewListPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<ReviewWithImages[]>([]);
  const [sortedReviews, setSortedReviews] = useState<ReviewWithImages[]>([]);
  const [regions, setRegions] = useState<string[]>(['전체']);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [currentSort, setCurrentSort] = useState('popularity_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [showMyReviewsOnly, setShowMyReviewsOnly] = useState(false); // ✅ 내 리뷰만 보기 상태

  // 지역 목록 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      const regionList = await getRegions();
      setRegions(['전체', ...regionList]);
    };
    
    fetchRegions();
  }, []);

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

  // 정렬 및 필터링 적용
  useEffect(() => {
    let filtered = [...reviews];

    // ✅ 내 리뷰만 보기 필터 적용
    if (showMyReviewsOnly && user) {
      filtered = filtered.filter(review => review.user_id === user.id);
    }

    // 정렬 적용
    switch (currentSort) {
      case 'popularity_desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      
      case 'name_asc':
        filtered.sort((a, b) => b.images.length - a.images.length);
        break;
      
      case 'rating_desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      
      case 'rating_asc':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      
      default:
        break;
    }

    setSortedReviews(filtered);
  }, [reviews, currentSort, showMyReviewsOnly, user]);

  // 리뷰 삭제 (콜백 함수)
  const handleDeleteCallback = (reviewId: string) => {
    setReviews(reviews.filter(review => review.review_id !== reviewId));
  };

  // 리뷰 수정
  const handleEdit = (reviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/review/write?edit=${reviewId}`);
  };

  // 별점 렌더링 (정수만)
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // 전체 리뷰 통계 계산 (정수 단위만)
  const calculateStats = () => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {} as Record<number, number>
      };
    }

    const ratingCounts: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      ratingCounts[i] = 0;
    }

    let totalRating = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      const roundedRating = Math.round(review.rating);
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

      {/* 지역 필터 & 정렬 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* 왼쪽: 지역 선택 + 내 리뷰만 보기 */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
          {/* 지역 선택 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">지역별 필터</h2>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ 내가 작성한 리뷰만 보기 버튼 */}
          {user && (
            <div className="flex items-center mt-8 md:mt-0">
              <button
                onClick={() => setShowMyReviewsOnly(!showMyReviewsOnly)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  showMyReviewsOnly
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showMyReviewsOnly ? '✓ 내 리뷰만 보기' : '내 리뷰만 보기'}
              </button>
            </div>
          )}
        </div>

        {/* 오른쪽: 정렬 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">정렬:</span>
          <Sort currentSort={currentSort} onSortChange={setCurrentSort} />
        </div>
      </div>

      {/* 통계 */}
      <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 평균 평점 */}
          <div className="flex flex-col items-center justify-center md:w-1/3 md:border-r border-gray-200 md:pr-8">
            <p className="text-sm text-gray-500 mb-2">평균 평점</p>
            <p className="text-5xl font-bold text-gray-900 mb-3">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((position) => {
                const roundedAvg = Math.round(stats.averageRating);
                return (
                  <span key={position} className={`text-3xl ${position <= roundedAvg ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                );
              })}
            </div>
            <p className="text-sm text-gray-500">
              총 리뷰 수 <span className="font-semibold text-gray-700 text-base">{stats.totalReviews}</span>개
            </p>
          </div>

          {/* 별점 분포 */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-semibold mb-4">별점 분포</p>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingCounts[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-10">{rating}점</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}개</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {showMyReviewsOnly
              ? '작성한 리뷰가 없습니다.'
              : selectedRegion === '전체' 
                ? '아직 작성된 리뷰가 없습니다.' 
                : `${selectedRegion} 지역에 작성된 리뷰가 없습니다.`}
          </p>
          {user && (
            <WriteButton className="mt-4" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.review_id}
              review={review}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDeleteCallback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
// app/detail/[reviewid]/page.tsx
// 리뷰 상세 조회 페이지
// 리뷰 메인 홈페이지에서 한개의 리뷰를 클릭했을때 나오는 페이지.
// app/review/detail/[id]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReviewById, type ReviewWithImages } from '@/lib/reviewStoreSupabase';
import { useAuth } from '@/hook/useAuth'; // 사용자 인증 훅 임포트
// import { ReviewActionButtons } from '@/component/review/ReviewButton'; // ReviewButton 컴포넌트에서 ReviewActionButtons를 명시적으로 임포트
import ImageModal from '@/component/review/ImageModal';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [review, setReview] = useState<ReviewWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState(0);

  // 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);
      const data = await getReviewById(id);
      console.log('리뷰 데이터:', data);
      console.log('이미지 데이터:', data?.images);
      setReview(data);
      setIsLoading(false);
    };

    fetchReview();
  }, [id]);

  // 이미지 클릭 핸들러
  const handleImageClick = (index: number) => {
    if (review && review.images.length > 0) {
      setModalImages(review.images.map(img => img.review_image));
      setModalIndex(index);
      setModalOpen(true);
    }
  };

  // 모달 네비게이션
  const handleModalNext = () => {
    setModalIndex((prev) => (prev + 1) % modalImages.length);
  };

  const handleModalPrev = () => {
    setModalIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-3xl ${i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
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

  // 삭제 후 콜백
  const handleDeleteCallback = () => {
    router.push('/review');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500 mb-4">리뷰를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push('/review')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          ← 뒤로 가기
        </button>

        {/* <div className="flex justify-between items-start"> */}
          {/* <div> */}
            {/* <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-3"> */}
              {/* {review.region} */}
            {/* </span> */}
            {/* <h1 className="text-3xl font-bold mb-2">{review.review_title}</h1> */}
          {/* </div> */}

          {/* 본인 리뷰인 경우 수정/삭제 버튼 */}
          {/* {user && user.id === review.user_id && ( */}
            {/* <ReviewActionButtons // ReviewActionButtons 컴포넌트 사용 */}
              {/* reviewId={review.review_id} // 리뷰 ID 전달 */}
              {/* onDelete={handleDeleteCallback} */}
            {/* /> */}
          {/* )} */}
        {/* </div> */}

        {/* 별점 */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          <span className="text-xl font-bold text-gray-800">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* 작성 정보 */}
        <div className="mt-4 text-sm text-gray-500 space-y-1">
          <p>
            <span className="font-medium">작성:</span> {formatDate(review.created_at)}
          </p>
          {review.updated_at && review.updated_at !== review.created_at && (
            <p className="text-orange-600">
              <span className="font-medium">수정됨:</span> {formatDate(review.updated_at)}
            </p>
          )}
        </div>
      </div>

      {/* 이미지 갤러리 */}
      {review.images.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">사진 ({review.images.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {review.images.map((image, index) => (
              <div
                key={image.review_image_id}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-200"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.review_image}
                  alt={`리뷰 이미지 ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                  onLoad={(e) => {
                    console.log('이미지 로드 성공:', image.review_image);
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    console.error('이미지 로드 실패:', image.review_image);
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-200"><span class="text-gray-400 text-sm">이미지 로드 실패</span></div>';
                    }
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s' }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리뷰 내용 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">리뷰 내용</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {review.review_content}
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          onClick={() => router.push('/review')}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          목록으로
        </button>
        {user && user.id === review.user_id && (
          <button
            onClick={() => router.push(`/review/edit/${review.review_id}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            수정하기
          </button>
        )}
      </div>

      {/* 이미지 모달 */}
      {modalOpen && (
        <ImageModal
          images={modalImages}
          currentIndex={modalIndex}
          onClose={() => setModalOpen(false)}
          onNext={handleModalNext}
          onPrev={handleModalPrev}
        />
      )}
    </div>
  );
}

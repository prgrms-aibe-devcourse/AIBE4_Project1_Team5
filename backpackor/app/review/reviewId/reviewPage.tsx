'use client';

import { useState } from 'react';
import ReviewForm from '@/component/review/ReviewForm';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  placeId: string;
  placeName: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  images: string[];
  createdAt: string;
}

// 목업 데이터 (실제로는 DB에서 가져옴)
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    placeId: 'jeju-mock-id',
    placeName: '제주도',
    rating: 4.5,
    title: '정말 아름다운 곳이에요!',
    content: '제주도는 정말 환상적인 곳이었습니다. 특히 성산일출봉에서 본 일출은 평생 잊지 못할 것 같아요. 날씨도 좋았고, 음식도 맛있었습니다.',
    author: '김여행',
    images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
    createdAt: '2024-10-10',
  },
  {
    id: '2',
    placeId: 'jeju-mock-id',
    placeName: '제주도',
    rating: 5.0,
    title: '가족 여행으로 최고!',
    content: '아이들과 함께 다녀왔는데 너무 좋았어요. 한라산 등반은 힘들었지만 보람찼고, 해변에서 놀기도 했습니다. 다음에 또 가고 싶네요!',
    author: '박가족',
    images: ['https://picsum.photos/400/300?random=3'],
    createdAt: '2024-10-08',
  },
  {
    id: '3',
    placeId: 'jeju-mock-id',
    placeName: '제주도',
    rating: 4.0,
    title: '좋았지만 날씨가 아쉬워요',
    content: '비가 많이 와서 계획했던 야외 활동을 많이 못했어요. 그래도 실내 관광지들도 볼 게 많아서 나름 즐거웠습니다.',
    author: '이여행자',
    images: [],
    createdAt: '2024-10-05',
  },
];

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState({
    placeId: 'jeju-mock-id',
    placeName: '제주도',
  });

  const handleReviewSubmit = (reviewData: any) => {
    console.log('새 리뷰 제출:', reviewData);
    
    // 새 리뷰를 목록에 추가
    const newReview: Review = {
      id: Date.now().toString(),
      placeId: reviewData.placeId,
      placeName: selectedPlace.placeName,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      author: reviewData.author,
      images: reviewData.images,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReviews([newReview, ...reviews]);
    setIsReviewFormOpen(false);
    
    // 실제로는 여기서 API 호출
    // await submitReview(reviewData);
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
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  여행 리뷰
                </h1>
                <p className="text-gray-600">
                  다른 여행자들의 생생한 후기를 확인하세요
                </p>
              </div>
              <button
                onClick={() => setIsReviewFormOpen(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-xl">✍️</span>
                리뷰 작성하기
              </button>
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
                  {reviews.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">총 리뷰 수</div>
              </div>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  아직 등록된 리뷰가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  첫 번째 리뷰를 작성해보세요!
                </p>
                <button
                  onClick={() => setIsReviewFormOpen(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                >
                  리뷰 작성하기
                </button>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  {/* 리뷰 헤더 */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {review.title}
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {review.placeName}
                        </span>
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
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {review.content}
                  </p>

                  {/* 이미지 갤러리 */}
                  {review.images.length > 0 && (
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

      {/* 리뷰 작성 모달 */}
      {isReviewFormOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsReviewFormOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsReviewFormOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>

            {/* ReviewForm 컴포넌트 */}
            <ReviewForm
              placeId={selectedPlace.placeId}
              placeName={selectedPlace.placeName}
              onSubmit={handleReviewSubmit}
              onCancel={() => setIsReviewFormOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
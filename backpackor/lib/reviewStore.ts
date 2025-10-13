// lib/reviewStore.ts
export interface Review {
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

// 브라우저 로컬 스토리지에 리뷰 저장
export const saveReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const reviews = getReviews();
  
  const newReview: Review = {
    id: Date.now().toString(),
    ...reviewData,
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  reviews.unshift(newReview); // 최신 리뷰를 맨 앞에 추가
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(reviews));
  }
  
  return newReview;
};

// 저장된 모든 리뷰 가져오기
export const getReviews = (): Review[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('travel-reviews');
  return stored ? JSON.parse(stored) : [];
};

// 특정 장소의 리뷰만 가져오기
export const getReviewsByPlaceId = (placeId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter(review => review.placeId === placeId);
};
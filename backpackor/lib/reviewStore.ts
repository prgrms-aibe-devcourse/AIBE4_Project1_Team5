// lib/reviewStore.ts
export interface Review {
  id: string;
  placeId: string;
  placeName: string;
  region: string;  // 지역 추가
  rating: number;
  title: string;
  content: string;
  author: string;
  images: string[];
  likes: number;  // 좋아요 수 추가
  likedBy: string[];  // 좋아요 누른 사용자 목록
  createdAt: string;
}

// 장소명에서 지역 추출
export const extractRegion = (placeName: string): string => {
  const regions = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시",
    "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
    "경기도", "강원도", "충청북도", "충청남도",
    "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
  ];
  
  for (const region of regions) {
    if (placeName.includes(region) || placeName.includes(region.slice(0, 2))) {
      return region;
    }
  }
  
  // 제주도 특별 처리
  if (placeName.includes("제주")) return "제주특별자치도";
  
  return "기타";
};

// 브라우저 로컬 스토리지에 리뷰 저장
export const saveReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'region'>) => {
  const reviews = getReviews();
  
  const newReview: Review = {
    id: Date.now().toString(),
    ...reviewData,
    region: extractRegion(reviewData.placeName),
    likes: 0,
    likedBy: [],
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
  if (!stored) return [];
  
  try {
    const reviews = JSON.parse(stored);
    // 기존 데이터 마이그레이션 (호환성 보장)
    return reviews.map((review: any) => ({
      ...review,
      region: review.region || extractRegion(review.placeName || ''),
      likes: review.likes || 0,
      likedBy: review.likedBy || [],
      images: review.images || [],
    }));
  } catch (error) {
    console.error('리뷰 데이터 로드 실패:', error);
    return [];
  }
};

// 특정 장소의 리뷰만 가져오기
export const getReviewsByPlaceId = (placeId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter(review => review.placeId === placeId);
};

// 특정 리뷰 가져오기
export const getReviewById = (reviewId: string): Review | null => {
  const reviews = getReviews();
  return reviews.find(r => r.id === reviewId) || null;
};

// 리뷰 수정
export const updateReview = (reviewId: string, updatedData: Partial<Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>>) => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return null;
  
  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...updatedData,
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(reviews));
  }
  
  return reviews[reviewIndex];
};

// 리뷰 삭제
export const deleteReview = (reviewId: string): boolean => {
  const reviews = getReviews();
  const filteredReviews = reviews.filter(r => r.id !== reviewId);
  
  if (filteredReviews.length === reviews.length) {
    return false; // 삭제할 리뷰가 없음
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(filteredReviews));
  }
  
  return true;
};
export const toggleLike = (reviewId: string, userId: string): Review | null => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return null;
  
  const review = reviews[reviewIndex];
  
  // 안전하게 처리 (기존 데이터 호환)
  if (!review.likedBy) review.likedBy = [];
  if (!review.likes) review.likes = 0;
  
  const hasLiked = review.likedBy.includes(userId);
  
  if (hasLiked) {
    // 좋아요 취소
    review.likes = Math.max(0, review.likes - 1);
    review.likedBy = review.likedBy.filter(id => id !== userId);
  } else {
    // 좋아요 추가
    review.likes += 1;
    review.likedBy.push(userId);
  }
  
  reviews[reviewIndex] = review;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(reviews));
  }
  
  return review;
};
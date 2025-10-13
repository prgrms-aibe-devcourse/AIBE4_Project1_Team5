// lib/reviewStore.ts
export interface Review {
  id: string;
  placeId: string;
  placeName: string;
  region: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  images: string[];
  likes: number;
  likedBy: string[];
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
  
  reviews.unshift(newReview);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(reviews));
  }
  
  return newReview;
};

export const getReviews = (): Review[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('travel-reviews');
  return stored ? JSON.parse(stored) : [];
};

export const getReviewsByPlaceId = (placeId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter(review => review.placeId === placeId);
};

export const toggleLike = (reviewId: string, userId: string): Review | null => {
  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return null;
  
  const review = reviews[reviewIndex];
  const hasLiked = review.likedBy.includes(userId);
  
  if (hasLiked) {
    review.likes -= 1;
    review.likedBy = review.likedBy.filter(id => id !== userId);
  } else {
    review.likes += 1;
    review.likedBy.push(userId);
  }
  
  reviews[reviewIndex] = review;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('travel-reviews', JSON.stringify(reviews));
  }
  
  return review;
};
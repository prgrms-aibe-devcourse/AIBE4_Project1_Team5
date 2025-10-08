export type TravelDetail = {
  place_id: string;
  place_name: string;
  place_address: string;
  place_description: string;
  latitude: number;
  longitude: number;
  place_image: string;
  place_detail_image: string;
  average_rating: number;
  favorite_count: number;
  region_id: number;
  place_type: string;
};

export type Review = {
  // 리뷰 테이블의 칼럼 정의
  review_id: string;
  place_id: string;
  user_id: string;
  review_title: string;
  review_content: string;
  rating: number;
  helpful_count: number;
  created_at: string;
  updated_at: string | null;
  is_public: boolean;
};

// RelatedPlacesSection에서 필요로 하는 타입
export type TravelSummary = {
  place_id: string;
  place_name: string;
  place_image: string;
  average_rating: number;
};

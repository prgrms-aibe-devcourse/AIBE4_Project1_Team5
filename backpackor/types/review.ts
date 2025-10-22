// 리뷰 관련 타입 정의

/** 리뷰 기본 타입 (DB review 테이블) */
export interface Review {
  review_id: string;
  place_id: string;
  user_id: string;
  region_id?: number | null; // region FK (region 테이블의 PK)
  review_title: string;
  review_content: string;
  rating: number;
  helpful_count?: number; // 도움됨 수
  is_public?: boolean; // 공개 여부
  created_at: string;
  updated_at: string | null;
}

/** 리뷰 이미지 타입 (DB review_image 테이블) */
export interface ReviewImage {
  review_image_id: number;
  review_id: string;
  review_image: string;
  image_order: number;
}

/** 이미지가 포함된 리뷰 */
export interface ReviewWithImages extends Review {
  images: ReviewImage[];
}

/** 리뷰 생성 데이터 */
export type CreateReviewData = Omit<Review, 'review_id' | 'created_at' | 'updated_at'>;

/** 리뷰 수정 데이터 */
export type UpdateReviewData = Partial<
  Pick<Review, 'region_id' | 'review_title' | 'review_content' | 'rating'>
>;
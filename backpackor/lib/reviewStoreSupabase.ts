// lib/reviewStoreSupabase.ts
import { supabase } from './supabaseClient';

// 리뷰 타입 정의
export interface Review {
  review_id: string;
  place_id: string;
  user_id: string;
  region: string;
  review_title: string;
  review_content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  review_image_id: number;
  review_id: string;  
  review_image: string;
  image_order: number; // 해당 리뷰의 총 이미지 개수
}

export interface ReviewWithImages extends Review {
  images: ReviewImage[];
}

// ========== 리뷰 CRUD ==========

// 리뷰 저장
export async function saveReview(reviewData: Omit<Review, 'review_id' | 'created_at' | 'updated_at'>): Promise<Review | null> {
  try {
    // ✅ region 이름으로 region_id 조회
    let region_id = null;
    if (reviewData.region) {
      const { data: regionData } = await supabase
        .from('region')
        .select('region_id')
        .eq('region_name', reviewData.region)
        .single();
      
      region_id = regionData?.region_id || null;
    }

    const { data, error } = await supabase
      .from('review')
      .insert({
        place_id: reviewData.place_id,
        user_id: reviewData.user_id,
        region_id: region_id, // ✅ region 대신 region_id 사용
        review_title: reviewData.review_title,
        review_content: reviewData.review_content,
        rating: reviewData.rating,
      })
      .select()
      .single();

    if (error) {
      console.error('리뷰 저장 실패:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('리뷰 저장 오류:', error);
    return null;
  }
}

// 모든 리뷰 가져오기 (이미지 포함, 최신순)
export async function getReviews(): Promise<ReviewWithImages[]> {
  try {
    const { data: reviews, error: reviewError } = await supabase
      .from('review')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewError) {
      console.error('리뷰 가져오기 실패:', reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    // 각 리뷰에 대한 이미지 가져오기
    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from('review_image')
          .select('*')
          .eq('review_id', review.review_id)
          .order('review_image_id', { ascending: true }); // ID 순서로 정렬 (첫 번째 = 썸네일)

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    return [];
  }
}

// 특정 지역 리뷰 가져오기
export async function getReviewsByRegion(region: string): Promise<ReviewWithImages[]> {
  try {
    // ✅ region 테이블과 조인하여 region_name으로 필터링
    const { data: reviews, error: reviewError } = await supabase
      .from('review')
      .select(`
        *,
        region!inner(region_name)
      `)
      .eq('region.region_name', region)
      .order('created_at', { ascending: false });

    if (reviewError) {
      console.error('지역별 리뷰 조회 실패:', reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from('review_image')
          .select('*')
          .eq('review_id', review.review_id)
          .order('review_image_id', { ascending: true });

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error('지역별 리뷰 가져오기 오류:', error);
    return [];
  }
}

// 특정 리뷰 가져오기 (ID로)
export async function getReviewById(reviewId: string): Promise<ReviewWithImages | null> {
  try {
    const { data: review, error: reviewError } = await supabase
      .from('review')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (reviewError || !review) {
      console.error('리뷰 가져오기 실패:', reviewError);
      return null;
    }

    const { data: images } = await supabase
      .from('review_image')
      .select('*')
      .eq('review_id', reviewId)
      .order('review_image_id', { ascending: true }); // ID 순서로 정렬 (첫 번째 = 썸네일)

    return {
      ...review,
      images: images || [],
    };
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    return null;
  }
}

// 리뷰 수정
export async function updateReview(
  reviewId: string,
  updates: Partial<Pick<Review, 'region' | 'review_title' | 'review_content' | 'rating'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('review')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('review_id', reviewId);

    if (error) {
      console.error('리뷰 수정 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return false;
  }
}

// 리뷰 삭제 (이미지도 함께 삭제)
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    // 1. 먼저 관련된 이미지들 가져오기
    const { data: images } = await supabase
      .from('review_image')
      .select('review_image')
      .eq('review_id', reviewId);

    // 2. Storage에서 이미지 파일 삭제
    if (images && images.length > 0) {
      for (const img of images) {
        await deleteImageFromStorage(img.review_image);
      }
    }

    // 3. DB에서 이미지 레코드 삭제
    await supabase
      .from('review_image')
      .delete()
      .eq('review_id', reviewId);

    // 4. 리뷰 삭제
    const { error } = await supabase
      .from('review')
      .delete()
      .eq('review_id', reviewId);

    if (error) {
      console.error('리뷰 삭제 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return false;
  }
}

// ========== 이미지 관련 ==========

// 이미지 업로드 (Supabase Storage)
// lib/reviewStoreSupabase.ts 의 uploadImage 함수 수정
// ✅ 수정된 uploadImage 함수
export async function uploadImage(file: File, reviewId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${reviewId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `review/${fileName}`;
    
    console.log('🔍 업로드 시도:', { filePath, fileType: file.type });
    // ✅ 업로드 - 버킷 이름을 review_image로 변경
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('review_image')  // ⭐ 하이픈(-) → 언더스코어(_)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${fileExt}`
      });

    if (uploadError) {
      console.error('Storage 업로드 실패:', uploadError);
      return null;
    }

    // ✅ Public URL 생성
    const { data: urlData } = supabase.storage
      .from('review_image')  // ⭐ 하이픈(-) → 언더스코어(_)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      console.error('Public URL 생성 실패');
      return null;
    }

    console.log('✅ 생성된 이미지 URL:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return null;
  }
}

// ✅ deleteImageFromStorage 함수도 수정
async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  try {
    // URL 파싱 - 버킷 이름을 review_image로 변경
    const urlParts = imageUrl.split('/review_image/');  // ⭐ 언더스코어(_)
    if (urlParts.length < 2) {
      console.error('잘못된 이미지 URL 형식:', imageUrl);
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('review_image')  // ⭐ 언더스코어(_)
      .remove([filePath]);

    if (error) {
      console.error('Storage 이미지 삭제 실패:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return false;
  }
}

// 리뷰 이미지 DB에 저장 (총 개수 포함)
export async function saveReviewImages(reviewId: string, imageUrls: string[]): Promise<boolean> {
  try {
    const totalCount = imageUrls.length; // 총 이미지 개수
    
    const imageRecords = imageUrls.map((url, index) => ({
      review_id: reviewId,
      review_image: url,
      image_order: totalCount, // 모든 이미지에 동일한 총 개수 저장
    }));

    const { error } = await supabase
      .from('review_image')
      .insert(imageRecords);

    if (error) {
      console.error('이미지 DB 저장 실패:', error);
      return false;
    }

    console.log('이미지 DB 저장 성공:', imageRecords.length, '개');
    return true;

  } catch (error) {
    console.error('이미지 DB 저장 오류:', error);
    return false;
  }
}

// 리뷰 이미지 삭제 (DB + Storage)
export async function deleteReviewImage(imageId: number, imageUrl: string): Promise<boolean> {
  try {
    // 1. Storage에서 삭제
    const storageDeleted = await deleteImageFromStorage(imageUrl);
    if (!storageDeleted) {
      console.warn('Storage 삭제 실패했지만 DB 삭제는 진행합니다');
    }

    // 2. DB에서 삭제
    const { error } = await supabase
      .from('review_image')
      .delete()
      .eq('review_image_id', imageId);

    if (error) {
      console.error('이미지 DB 삭제 실패:', error);
      return false;
    }

    console.log('이미지 삭제 완료 (DB + Storage)');
    return true;

  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return false;
  }
}

// ========== 유틸리티 ==========

// 지역 목록 가져오기
export async function getRegions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('region')
      .select('region_name')
      .order('region_id', { ascending: true });

    if (error) {
      console.error('지역 목록 가져오기 실패:', error);
      return [];
    }

    return data?.map(r => r.region_name) || [];
  } catch (error) {
    console.error('지역 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 사용자의 리뷰 가져오기
export async function getReviewsByUser(userId: string): Promise<ReviewWithImages[]> {
  try {
    const { data: reviews, error: reviewError } = await supabase
      .from('review')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewError) {
      console.error('사용자 리뷰 가져오기 실패:', reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from('review_image')
          .select('*')
          .eq('review_id', review.review_id)
          .order('image_order', { ascending: true }); // 이미지 순서대로 정렬

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error('사용자 리뷰 가져오기 오류:', error);
    return [];
  }
}
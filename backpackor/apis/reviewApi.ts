// 리뷰 CRUD API
import { supabase } from "@/lib/supabaseClient";
import type { Review, ReviewWithImages, CreateReviewData, UpdateReviewData } from "@/types/review";

// 특정 리뷰 가져오기 (ID로)
export const getReviewById = async (reviewId: string): Promise<ReviewWithImages | null> => {
  try {
    const { data: review, error: reviewError } = await supabase
      .from("review")
      .select("*")
      .eq("review_id", reviewId)
      .single();

    if (reviewError || !review) {
      console.error("리뷰 가져오기 실패:", reviewError);
      return null;
    }

    const { data: images } = await supabase
      .from("review_image")
      .select("*")
      .eq("review_id", reviewId)
      .order("review_image_id", { ascending: true });

    return {
      ...review,
      images: images || [],
    };
  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    return null;
  }
};

// 모든 리뷰 가져오기 (이미지 포함, 최신순)
export const getReviews = async (): Promise<ReviewWithImages[]> => {
  try {
    const { data: reviews, error: reviewError } = await supabase
      .from("review")
      .select("*")
      .order("created_at", { ascending: false });

    if (reviewError) {
      console.error("리뷰 가져오기 실패:", reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from("review_image")
          .select("*")
          .eq("review_id", review.review_id)
          .order("review_image_id", { ascending: true });

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    return [];
  }
};

// 특정 지역 리뷰 가져오기
export const getReviewsByRegion = async (regionId: number | null): Promise<ReviewWithImages[]> => {
  try {
    // regionId가 null이면 전체 리뷰 조회
    if (regionId === null) {
      return await getReviews();
    }

    const { data: reviews, error: reviewError } = await supabase
      .from("review")
      .select("*")
      .eq("region_id", regionId)
      .order("created_at", { ascending: false });

    if (reviewError) {
      console.error("리뷰 가져오기 실패:", reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from("review_image")
          .select("*")
          .eq("review_id", review.review_id)
          .order("review_image_id", { ascending: true });

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    return [];
  }
};

// 특정 사용자의 리뷰 가져오기
export const getReviewsByUser = async (userId: string): Promise<ReviewWithImages[]> => {
  try {
    const { data: reviews, error: reviewError } = await supabase
      .from("review")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (reviewError) {
      console.error("리뷰 가져오기 실패:", reviewError);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    const reviewsWithImages: ReviewWithImages[] = await Promise.all(
      reviews.map(async (review) => {
        const { data: images } = await supabase
          .from("review_image")
          .select("*")
          .eq("review_id", review.review_id)
          .order("image_order", { ascending: true });

        return {
          ...review,
          images: images || [],
        };
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    return [];
  }
};

// 리뷰 저장
export const saveReview = async (reviewData: CreateReviewData): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from("review")
      .insert({
        place_id: reviewData.place_id,
        user_id: reviewData.user_id,
        region_id: reviewData.region_id ?? null,
        review_title: reviewData.review_title,
        review_content: reviewData.review_content,
        rating: reviewData.rating,
      })
      .select()
      .single();

    if (error) {
      console.error("리뷰 저장 실패:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("리뷰 저장 오류:", error);
    return null;
  }
};

// 리뷰 수정
export const updateReview = async (
  reviewId: string,
  updates: UpdateReviewData
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("review")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("review_id", reviewId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 수정/삭제 오류:", error);
    return false;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const { data: images } = await supabase
      .from("review_image")
      .select("review_image")
      .eq("review_id", reviewId);

    if (images && images.length > 0) {
      for (const img of images) {
        await deleteImageFromStorage(img.review_image);
      }
    }

    await supabase.from("review_image").delete().eq("review_id", reviewId);

    const { error } = await supabase
      .from("review")
      .delete()
      .eq("review_id", reviewId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 수정/삭제 오류:", error);
    return false;
  }
};

// 이미지 업로드
export const uploadImage = async (file: File, reviewId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${reviewId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `review/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("review_image")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `image/${fileExt}`,
      });

    if (uploadError) {
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("review_image")
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return null;
    }

    return urlData.publicUrl;
  } catch (error) {
    return null;
  }
};

// Storage에서 이미지 삭제
const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
  try {
    const urlParts = imageUrl.split("/review_image/");
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("review_image")
      .remove([filePath]);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 수정/삭제 오류:", error);
    return false;
  }
};

// 리뷰 이미지 DB에 저장
export const saveReviewImages = async (reviewId: string, imageUrls: string[]): Promise<boolean> => {
  try {
    const totalCount = imageUrls.length;

    const imageRecords = imageUrls.map((url) => ({
      review_id: reviewId,
      review_image: url,
      image_order: totalCount,
    }));

    const { error } = await supabase.from("review_image").insert(imageRecords);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 수정/삭제 오류:", error);
    return false;
  }
};

// 리뷰 이미지 삭제 (DB + Storage)
export const deleteReviewImage = async (imageId: number, imageUrl: string): Promise<boolean> => {
  try {
    const storageDeleted = await deleteImageFromStorage(imageUrl);
    // Storage 삭제 실패해도 DB 삭제는 진행

    const { error } = await supabase
      .from("review_image")
      .delete()
      .eq("review_image_id", imageId);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 수정/삭제 오류:", error);
    return false;
  }
};

// 지역 목록 가져오기 (Deprecated - regionApi.ts의 getRegions 사용 권장)
// @deprecated Use getRegions from @/apis/regionApi instead
export const getRegions = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("region")
      .select("region_name")
      .order("region_id", { ascending: true });

    if (error) {
      return [];
    }

    return data?.map((r) => r.region_name) || [];
  } catch (error) {
    return [];
  }
};
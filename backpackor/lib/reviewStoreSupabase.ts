// lib/reviewStoreSupabase.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Review {
  review_id: string;
  user_id: string;
  place_id: string; // 여행지 ID (review_id와 동일한 값)
  region: string; // 지역
  review_title: string;
  review_content: string;
  rating: number;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ReviewImage {
  review_image_id: number;
  review_id: string;
  review_image: string;
  image_order: number;
}

// 리뷰와 이미지를 함께 가진 타입
export interface ReviewWithImages extends Review {
  images: ReviewImage[];
}

// 이미지 업로드
export const uploadImage = async (
  file: File,
  reviewId: string
): Promise<string | null> => {
  try {
    const supabase = createClientComponentClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${reviewId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("review-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("이미지 업로드 실패:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("review-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    return null;
  }
};

// 이미지 삭제 (Storage)
export const deleteImageFromStorage = async (
  imageUrl: string
): Promise<boolean> => {
  try {
    const supabase = createClientComponentClient();

    const urlParts = imageUrl.split("/review-images/");
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from("review-images")
      .remove([filePath]);

    if (error) {
      console.error("이미지 삭제 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    return false;
  }
};

// review_image 테이블에 이미지 저장
export const saveReviewImages = async (
  reviewId: string,
  imageUrls: string[]
): Promise<boolean> => {
  try {
    const supabase = createClientComponentClient();

    const imageData = imageUrls.map((url, index) => ({
      review_id: reviewId,
      review_image: url,
      image_order: index + 1,
    }));

    const { error } = await supabase.from("review_image").insert(imageData);

    if (error) {
      console.error("리뷰 이미지 저장 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 이미지 저장 오류:", error);
    return false;
  }
};

// 특정 리뷰의 이미지 조회
export const getReviewImages = async (
  reviewId: string
): Promise<ReviewImage[]> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review_image")
      .select("*")
      .eq("review_id", reviewId)
      .order("image_order", { ascending: true });

    if (error) {
      console.error("리뷰 이미지 조회 실패:", error);
      return [];
    }

    return (data || []) as ReviewImage[];
  } catch (error) {
    console.error("리뷰 이미지 조회 오류:", error);
    return [];
  }
};

// 리뷰 이미지 삭제 (DB)
export const deleteReviewImages = async (
  reviewId: string
): Promise<boolean> => {
  try {
    const supabase = createClientComponentClient();

    const images = await getReviewImages(reviewId);

    for (const image of images) {
      await deleteImageFromStorage(image.review_image);
    }

    const { error } = await supabase
      .from("review_image")
      .delete()
      .eq("review_id", reviewId);

    if (error) {
      console.error("리뷰 이미지 DB 삭제 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 이미지 삭제 오류:", error);
    return false;
  }
};

// 특정 이미지 삭제
export const deleteReviewImage = async (
  imageId: number,
  imageUrl: string
): Promise<boolean> => {
  try {
    const supabase = createClientComponentClient();

    await deleteImageFromStorage(imageUrl);

    const { error } = await supabase
      .from("review_image")
      .delete()
      .eq("review_image_id", imageId);

    if (error) {
      console.error("이미지 삭제 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    return false;
  }
};

// 리뷰 저장
export const saveReview = async (
  reviewData: Omit<
    Review,
    "review_id" | "created_at" | "updated_at" | "helpful_count"
  >
): Promise<Review | null> => {
  try {
    const supabase = createClientComponentClient();

    console.log("저장할 데이터:", reviewData);

    const uuid = crypto.randomUUID();
    const { data, error } = await supabase
      .from("review")
      .insert([
        {
          review_id: uuid, // ← 같은 UUID
          place_id: uuid, // ← 같은 UUID
          user_id: reviewData.user_id,
          region: reviewData.region,
          review_title: reviewData.review_title,
          review_content: reviewData.review_content,
          rating: reviewData.rating,
          helpful_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("리뷰 저장 실패:", error);
      console.error("에러 코드:", error.code);
      console.error("에러 메시지:", error.message);
      alert(`저장 실패: ${error.message}`);
      return null;
    }

    console.log("저장 성공:", data);
    return data as Review;
  } catch (error) {
    console.error("리뷰 저장 오류:", error);
    alert("리뷰 저장 중 예외가 발생했습니다.");
    return null;
  }
};

// 모든 리뷰 가져오기 (이미지 포함)
export const getReviews = async (): Promise<ReviewWithImages[]> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("리뷰 조회 실패:", error);
      return [];
    }

    const reviewsWithImages = await Promise.all(
      (data || []).map(async (review) => {
        const images = await getReviewImages(review.review_id);
        return { ...review, images } as ReviewWithImages;
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return [];
  }
};

// 특정 지역의 리뷰만 가져오기 (NEW!)
export const getReviewsByRegion = async (
  region: string
): Promise<ReviewWithImages[]> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("region", region)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("리뷰 조회 실패:", error);
      return [];
    }

    const reviewsWithImages = await Promise.all(
      (data || []).map(async (review) => {
        const images = await getReviewImages(review.review_id);
        return { ...review, images } as ReviewWithImages;
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return [];
  }
};

// 특정 사용자의 리뷰만 가져오기
export const getReviewsByUserId = async (
  userId: string
): Promise<ReviewWithImages[]> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("리뷰 조회 실패:", error);
      return [];
    }

    const reviewsWithImages = await Promise.all(
      (data || []).map(async (review) => {
        const images = await getReviewImages(review.review_id);
        return { ...review, images } as ReviewWithImages;
      })
    );

    return reviewsWithImages;
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return [];
  }
};

// 특정 리뷰 가져오기
export const getReviewById = async (
  reviewId: string
): Promise<ReviewWithImages | null> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("review_id", reviewId)
      .single();

    if (error) {
      console.error("리뷰 조회 실패:", error);
      return null;
    }

    const images = await getReviewImages(reviewId);

    return { ...data, images } as ReviewWithImages;
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return null;
  }
};

// 리뷰 수정
export const updateReview = async (
  reviewId: string,
  updatedData: Partial<
    Omit<
      Review,
      "review_id" | "user_id" | "created_at" | "updated_at" | "helpful_count"
    >
  >
): Promise<Review | null> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("review")
      .update({
        ...updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("review_id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("리뷰 수정 실패:", error);
      return null;
    }

    return data as Review;
  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    return null;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const supabase = createClientComponentClient();

    await deleteReviewImages(reviewId);

    const { error } = await supabase
      .from("review")
      .delete()
      .eq("review_id", reviewId);

    if (error) {
      console.error("리뷰 삭제 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    return false;
  }
};

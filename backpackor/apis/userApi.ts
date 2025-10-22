// 사용자 프로필 CRUD API
import { supabase } from "@/lib/supabaseClient";
import type { UserProfile, UpdateProfileData } from "@/types/user";

const DEFAULT_PROFILE_URL =
  "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

// 프로필 조회
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Profile fetch error:", error);
      return null;
    }

    return {
      user_id: userId,
      display_name: data?.display_name ?? null,
      profile_image: data?.profile_image ?? null,
      created_at: data?.created_at,
      updated_at: data?.updated_at,
    };
  } catch (err) {
    console.error("사용자 프로필 조회 실패:", err);
    return null;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return null;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile/${fileName}`;
    return imageUrl;
  } catch (err) {
    console.error("프로필 이미지 업로드 실패:", err);
    return null;
  }
};

// 프로필 이미지 삭제 (Storage)
export const deleteProfileImageFromStorage = async (
  imageUrl: string
): Promise<boolean> => {
  try {
    const fileName = imageUrl.split("/profile/")[1]?.split("?")[0];

    if (!fileName) {
      return false;
    }

    const { error } = await supabase.storage.from("profile").remove([fileName]);

    if (error) {
      console.error("Storage delete error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("프로필 이미지 삭제 실패:", err);
    return false;
  }
};

// 프로필 업데이트 (upsert)
export const updateUserProfile = async (
  userId: string,
  currentProfileImage: string | null,
  updates: UpdateProfileData
): Promise<boolean> => {
  try {
    let profileImageUrl = currentProfileImage;

    // 새로운 이미지 업로드
    if (updates.profile_image) {
      // 기존 이미지 삭제 (기본 프로필이 아닌 경우)
      if (
        currentProfileImage &&
        currentProfileImage !== DEFAULT_PROFILE_URL &&
        currentProfileImage !== null
      ) {
        await deleteProfileImageFromStorage(currentProfileImage);
      }

      // 새 이미지 업로드
      const uploadedUrl = await uploadProfileImage(userId, updates.profile_image);
      if (uploadedUrl) {
        profileImageUrl = uploadedUrl;
      }
    }

    // DB 업데이트
    const updateData: Partial<UserProfile> = {};
    if (updates.display_name !== undefined) {
      updateData.display_name = updates.display_name;
    }
    if (updates.profile_image) {
      updateData.profile_image = profileImageUrl;
    }

    const { error } = await supabase
      .from("user_profile")
      .upsert({
        user_id: userId,
        ...updateData,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Profile update error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("프로필 업데이트 실패:", err);
    return false;
  }
};

// 프로필 이미지 삭제 (DB + Storage)
export const deleteUserProfileImage = async (
  userId: string,
  currentProfileImage: string | null
): Promise<boolean> => {
  try {
    // Storage에서 삭제
    if (
      currentProfileImage &&
      currentProfileImage !== DEFAULT_PROFILE_URL &&
      currentProfileImage !== null
    ) {
      await deleteProfileImageFromStorage(currentProfileImage);
    }

    // DB 업데이트
    const { error } = await supabase
      .from("user_profile")
      .update({ profile_image: null })
      .eq("user_id", userId);

    if (error) {
      console.error("Profile delete error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("프로필 이미지 삭제 실패:", err);
    return false;
  }
};

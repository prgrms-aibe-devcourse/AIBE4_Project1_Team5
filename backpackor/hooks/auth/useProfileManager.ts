// 프로필 관리 훅
"use client";

import { useState } from "react";
import {
  updateUserProfile,
  deleteUserProfileImage,
} from "@/apis/userApi";
import type { UpdateProfileData } from "@/types/user";

export const useProfileManager = (
  userId: string | undefined,
  currentProfileImage: string | null
) => {
  const [isLoading, setIsLoading] = useState(false);

  const saveProfile = async (displayName: string) => {
    if (!userId) {
      alert("사용자 정보가 없습니다.");
      return false;
    }

    setIsLoading(true);
    try {
      const success = await updateUserProfile(userId, currentProfileImage, {
        display_name: displayName,
      });

      if (success) {
        alert("프로필이 업데이트되었습니다.");
        window.location.reload();
        return true;
      } else {
        throw new Error("프로필 업데이트 실패");
      }
    } catch (err) {
      alert("프로필 업데이트 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changeProfileImage = async (file: File) => {
    if (!userId) {
      alert("사용자 정보가 없습니다.");
      return false;
    }

    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return false;
    }

    setIsLoading(true);
    try {
      const success = await updateUserProfile(userId, currentProfileImage, {
        profile_image: file,
      });

      if (success) {
        alert("프로필 사진이 변경되었습니다.");
        window.location.reload();
        return true;
      } else {
        throw new Error("프로필 사진 변경 실패");
      }
    } catch (err) {
      alert("프로필 사진 변경 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async () => {
    if (!userId) {
      alert("사용자 정보가 없습니다.");
      return false;
    }

    if (!confirm("프로필 사진을 삭제하시겠습니까?")) {
      return false;
    }

    setIsLoading(true);
    try {
      const success = await deleteUserProfileImage(userId, currentProfileImage);

      if (success) {
        alert("프로필 사진이 삭제되었습니다.");
        window.location.reload();
        return true;
      } else {
        throw new Error("프로필 사진 삭제 실패");
      }
    } catch (err) {
      alert("프로필 사진 삭제 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveProfile,
    changeProfileImage,
    deleteImage,
  };
};

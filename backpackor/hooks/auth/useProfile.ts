// hook/useProfile.ts
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface UserProfile {
  display_name: string | null;
  profile_image: string | null;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const DEFAULT_PROFILE_URL =
    "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

  const refreshProfile = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 이미지 URL에 캐시 버스팅 추가하는 헬퍼 함수
  const addCacheBusting = (url: string | null) => {
    if (!url || url === DEFAULT_PROFILE_URL) return url;
    const timestamp = Date.now();
    return `${url}?t=${timestamp}`;
  };

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("display_name, profile_image")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
          throw error;
        }

        setProfile({
          display_name: data?.display_name ?? null,
          profile_image: data?.profile_image ?? DEFAULT_PROFILE_URL,
        });
      } catch (err) {
        console.error("user_profile 조회 실패:", err);
        setProfile({
          display_name: null,
          profile_image: DEFAULT_PROFILE_URL,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // 실시간 구독 설정
    const channel = supabase
      .channel(`profile-${userId}-${refreshKey}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profile",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile({
              display_name: (payload.new as any).display_name ?? null,
              profile_image:
                (payload.new as any).profile_image ?? DEFAULT_PROFILE_URL,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshKey]);

  const updateProfile = async (
    updates: Partial<{
      display_name: string;
      profile_image: File;
    }>
  ) => {
    if (!userId) throw new Error("사용자 ID가 없습니다.");

    try {
      let profileImageUrl = profile?.profile_image || null;

      // 새로운 사진이 업로드된 경우
      if (updates.profile_image) {
        // 기존 사진 삭제 (기본 프로필이 아닌 경우에만)
        if (
          profile?.profile_image &&
          profile.profile_image !== DEFAULT_PROFILE_URL &&
          profile.profile_image !== null
        ) {
          const fileName = profile.profile_image
            .split("/profile/")[1]
            ?.split("?")[0];

          if (fileName) {
            await supabase.storage.from("profile").remove([fileName]);
          }
        }

        // 파일명을 user_id로 설정 (확장자 포함)
        const fileExt = updates.profile_image.name.split(".").pop();
        const fileName = `${userId}.${fileExt}`;

        // 새로운 사진 업로드
        const { error: uploadError } = await supabase.storage
          .from("profile")
          .upload(fileName, updates.profile_image, {
            upsert: true,
            contentType: updates.profile_image.type,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }

        // Supabase Storage public URL 생성
        const { data: publicUrlData } = supabase.storage
          .from("profile")
          .getPublicUrl(fileName);

        profileImageUrl = publicUrlData.publicUrl;
      }

      // user_profile 테이블 업데이트
      const updateData: any = {};
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
        throw error;
      }

      // 로컬 상태 업데이트
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...(updates.display_name !== undefined && {
                display_name: updates.display_name,
              }),
              ...(updates.profile_image && { profile_image: profileImageUrl }),
            }
          : null
      );
    } catch (err) {
      console.error("프로필 업데이트 실패:", err);
      throw err;
    }
  };

  const deleteProfileImage = async () => {
    if (!userId) throw new Error("사용자 ID가 없습니다.");

    try {
      // storage에서 사진 삭제
      if (
        profile?.profile_image &&
        profile.profile_image !== DEFAULT_PROFILE_URL &&
        profile.profile_image !== null
      ) {
        const fileName = profile.profile_image
          .split("/profile/")[1]
          ?.split("?")[0];

        if (fileName) {
          await supabase.storage.from("profile").remove([fileName]);
        }
      }

      // user_profile 테이블에서 profile_image를 null로 업데이트
      const { error } = await supabase
        .from("user_profile")
        .update({ profile_image: null })
        .eq("user_id", userId);

      if (error) {
        console.error("Profile delete error:", error);
        throw error;
      }

      // 로컬 상태 업데이트
      setProfile((prev) => (prev ? { ...prev, profile_image: null } : null));
    } catch (err) {
      console.error("프로필 사진 삭제 실패:", err);
      throw err;
    }
  };

  // 캐시 버스팅이 적용된 URL 반환
  const profileUrl = profile?.profile_image
    ? addCacheBusting(profile.profile_image)
    : DEFAULT_PROFILE_URL;

  return {
    profile,
    profileUrl,
    updateProfile,
    deleteProfileImage,
    refreshProfile,
    isLoading,
  };
}

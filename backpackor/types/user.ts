// 사용자 프로필 관련 타입 정의

/** 사용자 프로필 (DB 테이블) */
export interface UserProfile {
  user_id: string;
  display_name?: string | null;
  profile_image?: string | null;
  user_name?: string;
  user_email?: string;
  user_profile_image?: string | null;
  user_bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  display_name?: string;
  profile_image?: File;
}

export interface ProfileFormData {
  displayName: string;
}

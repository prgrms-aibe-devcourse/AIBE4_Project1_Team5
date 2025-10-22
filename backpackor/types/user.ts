// 사용자 프로필 관련 타입 정의

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  profile_image: string | null;
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

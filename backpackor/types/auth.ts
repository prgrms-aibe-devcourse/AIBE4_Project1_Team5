// 인증 관련 타입 정의
import type { Provider } from "@supabase/supabase-js";

export type SocialProvider = Extract<Provider, "google" | "kakao" | "github">;

export interface AuthUser {
  id: string;
  email: string | undefined;
  created_at: string;
}

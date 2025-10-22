// 인증 관련 API
import { supabase } from "@/lib/supabaseClient";
import type { SocialProvider } from "@/types/auth";

// 소셜 로그인
export const loginWithSocial = async (
  provider: SocialProvider,
  redirectTo: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    return { error };
  } catch (err) {
    console.error(`${provider} 로그인 실패:`, err);
    return { error: err as Error };
  }
};

// 로그아웃
export const logout = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error("로그아웃 실패:", err);
    return { error: err as Error };
  }
};

// 현재 세션 가져오기
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

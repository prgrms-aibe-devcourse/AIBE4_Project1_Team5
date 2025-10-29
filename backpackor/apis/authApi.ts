// apis/authApi.ts
import { createBrowserClient } from "@/lib/supabaseClient";
import type { SocialProvider } from "@/types/auth";

/**
 * 현재 실행 환경에 맞는 redirect URL 생성
 */
const getRedirectBaseUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

// 소셜 로그인
export const loginWithSocial = async (provider: SocialProvider) => {
    try {
        const supabase = createBrowserClient();
        const redirectTo = `${getRedirectBaseUrl()}/auth/callback`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
                skipBrowserRedirect: false,
            },
        });

        return { error };
    } catch (err) {
        console.error(`${provider} 로그인 실패:`, err);
        return { error: err as Error };
    }
};

// 로그아웃
export const logout = async () => {
    try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!data?.session) return { error: null };
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (err) {
        console.error("로그아웃 실패:", err);
        return { error: err as Error };
    }
};

// 현재 세션 확인
export const getCurrentSession = async () => {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
};

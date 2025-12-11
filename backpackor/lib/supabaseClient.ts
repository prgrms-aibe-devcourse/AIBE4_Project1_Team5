// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

/**
 * 서버용 Supabase 클라이언트
 * 서버 컴포넌트, API 라우트, 서버 액션에서 사용
 */
export const createServerClient = () => {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false, // 서버에서는 세션을 저장하지 않음
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
};

/**
 * 브라우저용 Supabase 클라이언트 (싱글톤)
 * 클라이언트 컴포넌트에서 사용
 */
let browserClient: SupabaseClient | null = null;

export const createBrowserClient = () => {
    // 서버 사이드에서 호출되면 에러
    if (typeof window === "undefined") {
        throw new Error("createBrowserClient는 브라우저에서만 사용 가능합니다. 서버에서는 createServerClient를 사용하세요.");
    }

    // 싱글톤 패턴으로 하나의 인스턴스만 생성
    if (!browserClient) {
        browserClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                flowType: "pkce" as const,
                storage: typeof window !== "undefined" ? window.localStorage : undefined,
            },
        });
    }

    return browserClient;
};

/**
 * 브라우저용 Supabase 클라이언트 (편의성 export)
 * 클라이언트 컴포넌트와 hooks에서 사용하세요
 *
 * 주의: 서버 컴포넌트에서는 createServerClient()를 사용하세요
 */
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        // 실제 호출 시점에 브라우저 클라이언트를 반환
        const client = createBrowserClient();
        return client[prop as keyof SupabaseClient];
    }
});

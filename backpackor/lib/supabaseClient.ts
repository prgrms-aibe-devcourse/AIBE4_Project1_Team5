// Supabase DB와 통신하기 위한 서버용/브라우저용 클라이언트를 생성하는 유틸리티 파일
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createLoggedSupabaseClient } from "@/utils/queryLogger";
import { getBaseUrl } from "@/utils/url";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

// 개발 환경에서만 쿼리 로깅 활성화
const enableQueryLogging = process.env.NODE_ENV === "development";

// Supabase 클라이언트 옵션 (auth 설정 포함)
const getSupabaseOptions = () => ({
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce" as const,
  },
});

// 서버 환경
export const createServerClient = () => {
  const client = createClient(supabaseUrl, supabaseKey, getSupabaseOptions());
  return enableQueryLogging ? createLoggedSupabaseClient(client) : client;
};

// 브라우저 클라이언트 싱글톤 인스턴스
let browserClientInstance: SupabaseClient | null = null;

// 클라이언트 환경 (싱글톤 패턴)
export const createBrowserClient = () => {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 매번 새로운 클라이언트 생성
    const client = createClient(
      supabaseUrl!,
      supabaseKey!,
      getSupabaseOptions()
    );
    return enableQueryLogging ? createLoggedSupabaseClient(client) : client;
  }

  // 브라우저에서는 싱글톤 인스턴스 재사용
  if (!browserClientInstance) {
    const client = createClient(
      supabaseUrl!,
      supabaseKey!,
      getSupabaseOptions()
    );
    browserClientInstance = enableQueryLogging
      ? createLoggedSupabaseClient(client)
      : client;
  }

  return browserClientInstance;
};

// 브라우저 환경에서 바로 사용 가능한 기본 인스턴스
export const supabase = createBrowserClient();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

// 기존 createServerClient 함수 유지
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

// 싱글톤 supabase 객체 추가 export
export const supabase = createClient(supabaseUrl, supabaseKey);

// (선택) 브라우저용 클라이언트도 유지
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

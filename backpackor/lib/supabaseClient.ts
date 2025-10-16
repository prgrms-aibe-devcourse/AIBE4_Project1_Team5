// Supabase DB와 통신하기 위한 서버용/브라우저용 클라이언트를 생성하는 유틸리티 파일
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

// 서버 환경
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};

// 클라이언트 환경
export const createBrowserClient = () => {
  return createClient(supabaseUrl!, supabaseKey!);
};

// 브라우저 환경에서 바로 사용 가능한 기본 인스턴스
export const supabase = createBrowserClient();

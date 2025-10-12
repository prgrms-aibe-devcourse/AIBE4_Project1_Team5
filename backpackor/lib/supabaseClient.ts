// Supabase DB와 통신하기 위한 서버용/브라우저용 클라이언트를 생성하는 유틸리티 파일
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

export const createServerClient = () => {
    return createClient(supabaseUrl, supabaseKey);
};

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
export const createBrowserClient = () => {
    // 중요: 브라우저에서는 항상 anon key를 사용해야 합니다.
    return createClient(supabaseUrl!, supabaseAnonKey!);
}
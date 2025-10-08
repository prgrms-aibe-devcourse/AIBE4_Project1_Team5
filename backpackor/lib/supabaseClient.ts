import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("[Supabase 설정 오류] 환경변수가 누락되었습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

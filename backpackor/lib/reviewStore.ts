// lib/supabase.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

// 클라이언트 컴포넌트용
export const getSupabaseClient = () => {
  return createClientComponentClient();
};

// 서버 컴포넌트용 (필요시)
export const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

  return createClient(supabaseUrl, supabaseKey);
};

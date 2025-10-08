import {
  // createServerClient에 별칭을 부여하여 이름 충돌을 피합니다.
  createServerClient as createSsrClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

// ⭐️ 이 함수만 export 합니다. ⭐️
export const createServerClient = async () => {
  const cookieStore = await cookies();

  return await createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
};

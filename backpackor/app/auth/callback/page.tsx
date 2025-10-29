"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabaseClient";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // 브라우저에서만 supabase 클라이언트 생성
                const supabase = createBrowserClient();

                // URL에서 code 파라미터 확인
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');

                if (code) {
                    // Supabase가 자동으로 code를 session으로 교환
                    // detectSessionInUrl: true 옵션으로 자동 처리됨
                    const { data, error } = await supabase.auth.getSession();

                    if (error) {
                        console.error("Auth callback error:", error.message);
                        router.replace("/"); // 에러 발생 시에도 홈으로 이동
                    } else if (data.session) {
                        console.log("Login successful:", data.session.user.email);

                        // redirectAfterLogin이 있으면 해당 페이지로, 없으면 홈으로
                        const redirectTo = sessionStorage.getItem("redirectAfterLogin");
                        if (redirectTo) {
                            sessionStorage.removeItem("redirectAfterLogin");
                            router.replace(redirectTo);
                        } else {
                            router.replace("/");
                        }
                    } else {
                        // 세션이 아직 생성 중일 수 있으므로 잠시 대기 후 재시도
                        setTimeout(() => {
                            const redirectTo = sessionStorage.getItem("redirectAfterLogin");
                            if (redirectTo) {
                                sessionStorage.removeItem("redirectAfterLogin");
                                router.replace(redirectTo);
                            } else {
                                router.replace("/");
                            }
                        }, 1000);
                    }
                } else {
                    // code가 없으면 바로 홈으로 이동
                    router.replace("/");
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                router.replace("/");
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div
            style={{
                textAlign: "center",
                marginTop: "100px",
                fontSize: "18px",
                fontWeight: "500",
            }}
        >
            로그인 중입니다...
        </div>
    );
}

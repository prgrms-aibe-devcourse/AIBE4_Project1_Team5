// Kakao Maps SDK 로더 훅
"use client";

import { useEffect, useState } from "react";
import type { KakaoLoaderState } from "@/types/map";

/** Kakao Maps SDK를 동적으로 로드하는 훅 */
export const useKakaoLoader = (apiKey?: string): KakaoLoaderState => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === "undefined") {
      return;
    }

    // 이미 로드된 경우
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    // API Key 미제공
    if (!apiKey) {
      setError("Kakao API Key가 제공되지 않았습니다.");
      return;
    }

    const scriptId = "kakao-maps-sdk";

    // 이미 스크립트가 추가된 경우
    if (document.getElementById(scriptId)) {
      return;
    }

    // 스크립트 동적 추가
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;

    script.onload = () => {
      window.kakao.maps.load(() => {
        // SDK 완전 로드까지 약간의 지연
        setTimeout(() => setLoaded(true), 100);
      });
    };

    script.onerror = () => {
      setError("Kakao Maps SDK 로드 실패");
    };

    document.head.appendChild(script);
  }, [apiKey]);

  return { loaded, error };
};

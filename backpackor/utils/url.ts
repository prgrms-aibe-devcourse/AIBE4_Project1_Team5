// 환경에 따른 baseUrl 설정 유틸리티

/**
 * 현재 환경에 맞는 base URL을 반환합니다.
 * - development (localhost): http://localhost:3000
 * - production (vercel): https://backpackor.vercel.app
 */
export const getBaseUrl = (): string => {
  // 클라이언트 사이드: 현재 브라우저 URL로 판단
  if (typeof window !== "undefined") {
    // localhost에서 접속한 경우 -> 로컬 환경
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
    // 그 외 (vercel.app 등) -> 프로덕션 환경
    return window.location.origin;
  }

  // 서버 사이드: 환경 변수로 판단
  // NEXT_PUBLIC_BASE_URL이 설정되어 있으면 해당 값 사용
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercel 배포 환경
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // fallback: localhost
  return "http://localhost:3000";
};

/**
 * API 호출을 위한 base URL을 반환합니다.
 * - development: http://localhost:3000/api
 * - production: https://backpackor.vercel.app/api
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api`;
};

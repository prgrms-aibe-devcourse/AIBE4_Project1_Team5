// 환경에 따른 baseUrl 설정 유틸리티

/**
 * 현재 환경에 맞는 base URL을 반환합니다.
 * - development: http://localhost:3000
 * - production: https://backpackor.vercel.app
 */
export const getBaseUrl = (): string => {
  // 서버 사이드에서 Vercel 환경 변수 확인
  if (typeof window === "undefined") {
    // Vercel 배포 환경
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // 개발 환경
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  // 클라이언트 사이드에서는 window.location.origin 사용
  return window.location.origin;
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

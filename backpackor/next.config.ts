/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 희수님이 추가한 도메인들
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // 팀원이 추가했던 Supabase 스토리지 도메인
      {
        protocol: "https",
        hostname: "rlnpoyrapczrsgmxtlrr.supabase.co",
      },
    ],
  },
  // (만약 팀원이 추가했던 다른 설정이 있다면 여기에 유지됩니다)
};

export default nextConfig;

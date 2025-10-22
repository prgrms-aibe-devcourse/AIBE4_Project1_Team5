/** @type {import('next').NextConfig} */

const withCritters = require("@critters/next").default;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "rlnpoyrapczrsgmxtlrr.supabase.co",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // CSS 최적화: 사용하지 않는 CSS 제거
  experimental: {
    optimizeCss: true,
  },
};

// CommonJS 방식으로 export
module.exports = withCritters(nextConfig);

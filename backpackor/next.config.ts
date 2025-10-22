/** @type {import('next').NextConfig} */

const withCritters = require("@critters/next");

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
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withCritters(nextConfig);

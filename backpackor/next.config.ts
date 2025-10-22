/** @type {import('next').NextConfig} */
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

export default nextConfig;

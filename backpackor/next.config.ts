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
            {
                protocol: "http",
                hostname: "tong.visitkorea.or.kr",
            },
            {
                protocol: "https",
                hostname: "tong.visitkorea.or.kr",
            },
        ],

        domains: [
            "tong.visitkorea.or.kr",
            "mblogthumb-phinf.pstatic.net",
            "thumb2.tripinfo.co.kr",
            "your-project.supabase.co",
        ],

        unoptimized: true,

        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

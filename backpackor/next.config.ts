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
        hostname: "새로알아낸주소.com", // <<-- 여기에 추가!
        port: "",
        pathname: "/**",
      },
    ],
  },
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["rlnpoyrapczrsgmxtlrr.supabase.co"],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "dgalywyr863hv.cloudfront.net" }, // Strava photos
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },
};
export default nextConfig;

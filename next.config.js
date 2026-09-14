/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Don't let lint warnings (e.g. unescaped apostrophes in copy) block a
  // production deploy — `npm run lint` still surfaces them for cleanup.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

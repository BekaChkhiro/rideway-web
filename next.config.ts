import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-76cefa6348404990a1ef5271ccf16230.r2.dev',
        pathname: '/**',
      },
    ],
    // R2 images are already optimized, skip Next.js optimization for faster loading
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/learn-with-towhid',
  images: {
    unoptimized: true,
  },
  // Optional: If you have persistent type errors you want to ignore to force a deploy
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

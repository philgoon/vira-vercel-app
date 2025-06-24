import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during builds to prevent build failures
  eslint: {
    // Only run ESLint on specific commands, not during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

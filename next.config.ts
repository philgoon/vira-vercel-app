import type { NextConfig } from "next";
import os from 'os';
import path from 'path';

const nextConfig: NextConfig = {
  // Disable ESLint during builds to prevent build failures
  eslint: {
    // Only run ESLint on specific commands, not during builds
    ignoreDuringBuilds: true,
  },
  // Windows-specific optimizations to prevent Jest worker crashes
  experimental: {
    forceSwcTransforms: false,
    // Limit CPU usage on Windows to prevent child process crashes
    cpus: process.platform === 'win32' ? Math.min(os.cpus().length, 2) : undefined,
    // Enable webpack build worker for better memory management
    webpackBuildWorker: true,
    // Enable memory optimizations
    webpackMemoryOptimizations: true,
  },
  
  // Webpack configuration for Windows development
  webpack: (config, { dev, isServer }) => {
    // Windows-specific development optimizations
    if (dev && process.platform === 'win32') {
      // Limit parallelism to prevent worker crashes
      config.parallelism = 1;
      
      // Optimize file system watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      
      // Enable filesystem caching for better performance
      // CRITICAL: Always use absolute paths for webpack cache directories
      // Relative paths cause "Invalid configuration object" errors
      const cacheDir = path.resolve(__dirname, '.next/cache/webpack');
      
      // Validation: Ensure we have an absolute path
      if (!path.isAbsolute(cacheDir)) {
        throw new Error(`Webpack cache directory must be absolute path. Got: ${cacheDir}`);
      }
      
      config.cache = {
        type: 'filesystem',
        cacheDirectory: cacheDir,
      };
    }
    
    return config;
  },
};

export default nextConfig;

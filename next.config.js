/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: true,
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withSerwist(nextConfig);

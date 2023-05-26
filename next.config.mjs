import withPWA from "@imbios/next-pwa";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const withPWAConfig = withPWA({
  buildExcludes: ["app-build-manifest.json"],
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["pl"],
    defaultLocale: "pl",
  },
};

export default withPWAConfig(nextConfig);

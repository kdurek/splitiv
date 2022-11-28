/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pages from "vite-plugin-pages";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), pages(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    // Remove when fixed
    deps: {
      fallbackCJS: true,
    },
  },
});

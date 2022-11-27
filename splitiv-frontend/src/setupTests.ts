/* eslint-disable import/no-extraneous-dependencies */
import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

// Remove when fixed
import "@testing-library/jest-dom";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

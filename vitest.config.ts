import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(currentDir, "./src"),
      "@tests": path.resolve(currentDir, "./tests"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/helpers/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/**/types/**",
        // Next.js app-dir entry points are not unit-testable
        "src/app/**",
        // Config files are smoke-tested separately
        "src/config/**",
        // Pure re-export barrels
        "src/**/index.ts",
        "src/proxy.ts",
        "src/auth.ts",
      ],
      reporter: ["text", "lcov", "json-summary", "html"],
    },
  },
});

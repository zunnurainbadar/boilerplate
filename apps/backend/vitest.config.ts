import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/db/truncate.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: "postgresql://localhost:5432/ai_boilerplate_test",
    },
  },
});

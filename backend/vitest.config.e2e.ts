import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    // The first run downloads the MongoDB binary used by mongodb-memory-server
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});

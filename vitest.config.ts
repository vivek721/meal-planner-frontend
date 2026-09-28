import { defineConfig } from 'vitest/config';

// Unit tests cover pure data-layer logic only (no DOM); Playwright covers the UI.
// Restricted to src/ so Vitest never picks up the Playwright specs in tests/.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});

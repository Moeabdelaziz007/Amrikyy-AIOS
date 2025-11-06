import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use node environment for backend tests
    setupFiles: [], // No setup files needed
  },
});
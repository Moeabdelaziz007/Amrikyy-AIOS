import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Removed "alias" configuration as it conflicted with native browser module loading
    // The application now relies on relative paths for imports.
  },
});
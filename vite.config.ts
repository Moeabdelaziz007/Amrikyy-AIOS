import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // This project is configured to use explicit relative paths for module imports (e.g., './', '../').
    // Alias configurations (like '@/') are intentionally removed or not configured
    // to prevent resolution issues in environments that do not support them natively.
    // If you encounter "Failed to resolve module specifier" errors, ensure all imports
    // use relative paths and check for any lingering alias configurations in your setup.
    // Removed "alias" configuration as it conflicted with native browser module loading
    // The application now relies on relative paths for imports.
  },
});
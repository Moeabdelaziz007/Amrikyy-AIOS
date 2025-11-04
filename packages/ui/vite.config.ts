import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auraos/core': path.resolve(__dirname, '../core/src'),
      '@auraos/ai': path.resolve(__dirname, '../ai/src'),
      '@auraos/common': path.resolve(__dirname, '../common/src'),
      '@auraos/firebase': path.resolve(__dirname, '../firebase/src/index.ts'),
      '@auraos/hooks': path.resolve(__dirname, '../hooks/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // فصل مكتبات React
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // فصل مكتبات Radix UI
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // فصل مكتبات الرسوم البيانية
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          // فصل مكتبات الحركة
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          // فصل مكتبات الأيقونات
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // فصل مكتبات Firebase
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          // فصل مكتبات التحميل الكسول
          if (id.includes('@loadable/component')) {
            return 'loadable-vendor';
          }
          // فصل التطبيقات
          if (id.includes('/apps/')) {
            return 'apps';
          }
          // فصل المكونات
          if (id.includes('/components/')) {
            return 'components';
          }
          // فصل الخدمات
          if (id.includes('/services/')) {
            return 'services';
          }
          // مكتبات أخرى
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [react()], // Ensure React plugin is always active
      
      // Crucial: Explicitly configure esbuild for TypeScript transpilation
      // This ensures .ts and .tsx files, especially in .storybook, are processed
      esbuild: {
        loader: 'tsx', // Process .ts and .tsx files as TSX
        include: /\.tsx?$/,
        exclude: /node_modules/, // Exclude node_modules to avoid conflicts
      },
      
      // Ensure PostCSS is correctly configured for Tailwind
      css: {
        postcss: {
          plugins: [
            tailwindcss(path.resolve(__dirname, '../tailwind.config.js')),
            autoprefixer,
          ],
        },
      },
      
      // Optimize dependencies, including Storybook's own config files
      optimizeDeps: {
        entries: [
          path.resolve(__dirname, './preview.ts'),
          path.resolve(__dirname, './main.ts'),
          path.resolve(__dirname, '../src/**/*.stories.tsx'),
          path.resolve(__dirname, '../src/**/*.stories.ts'),
        ],
      },
    });
  },
};

export default config;

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
      plugins: [react()], // Explicitly add React plugin
      esbuild: {
        loader: 'tsx', // Ensure .ts and .tsx files are processed as TSX
        include: /\.tsx?$/,
      },
      // This is crucial for Storybook to correctly process its own config files
      optimizeDeps: {
        include: [
          '@storybook/react-vite',
          '@storybook/addon-essentials',
          '@storybook/addon-interactions',
          '@storybook/addon-links',
          '@storybook/blocks',
          '@storybook/react',
          '@storybook/testing-library',
          // Explicitly include .storybook files for optimization
          path.resolve(__dirname, './preview.ts'),
          path.resolve(__dirname, './main.ts'),
        ],
      },
      // Ensure PostCSS is correctly configured, even if postcss.config.js is present
      css: {
        postcss: {
          plugins: [
            require('tailwindcss')(path.resolve(__dirname, '../tailwind.config.js')),
            require('autoprefixer'),
          ],
        },
      },
    });
  },
};

export default config;

        commonjsOptions: {
          include: [/node_modules/, /packages/],
        },
      },
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
    // Make Vite aware of the monorepo workspace root so it can serve/resolve
    // files that live outside the package (pnpm symlinks / hoisted deps).
    const workspaceRoot = path.resolve(__dirname, '../../..');

    return mergeConfig(config, {
      plugins: [react()],

      // Allow the Vite dev server to access the repository workspace root.
      server: {
        fs: {
          allow: [workspaceRoot],
        },
      },

      // Keep Vite's default CSS/PostCSS handling so existing
      // postcss.config.js / tailwind.config.js are respected.

      // Add some safe dependency optimization for faster cold-starts.
      optimizeDeps: {
        include: [
          'react',
          'react-dom'
        ],
      },

      // For pnpm monorepos where packages may be symlinked, ensure
      // CommonJS dependencies are properly included when necessary.
      build: {
    });
  },
};

export default config;

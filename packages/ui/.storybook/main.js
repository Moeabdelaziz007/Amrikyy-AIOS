// Fallback CommonJS Storybook config for environments that expect a JS `main.js`.
// It mirrors the TypeScript `main.ts` configuration.
const path = require('path');
const react = require('@vitejs/plugin-react');

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    const workspaceRoot = path.resolve(__dirname, '../../..');
    return {
      ...config,
      plugins: [react()],
      server: {
        fs: {
          allow: [workspaceRoot],
        },
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/, /packages/],
        },
      },
    };
  },
};


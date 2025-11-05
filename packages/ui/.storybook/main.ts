import path from 'path';
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)",
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
  env: (config) => ({
    ...config,
    STORYBOOK_DISABLE_TELEMETRY: '1',
  }),
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config, { configType }) => {
    // Fix for monorepo and virtual module resolution
    config.server = config.server || {};
    config.server.fs = config.server.fs || {};

    // allow workspace root (adjust relative levels if your repo layout differs)
    const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
    config.server.fs.allow = Array.from(new Set([...(config.server.fs.allow || []), workspaceRoot]));

    // Ensure proper React handling
    config.resolve = config.resolve || {};
    config.resolve.dedupe = Array.from(new Set([...(config.resolve.dedupe || []), 'react', 'react-dom']));

    // Fix virtual module resolution
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = Array.from(new Set([
      ...(config.optimizeDeps.include || []),
      'react',
      'react-dom',
    ]));

    // Fix for build issues
    if (configType === 'PRODUCTION') {
      config.build = config.build || {};
      config.build.rollupOptions = config.build.rollupOptions || {};
      config.build.rollupOptions.input = path.resolve(__dirname, 'preview.js');
    }

    return config;
  },
};

export default config;

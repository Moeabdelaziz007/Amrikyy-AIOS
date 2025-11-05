
    // Add a post transformIndexHtml plugin to rewrite virtual: URLs in iframe.html
    const iframeRewritePlugin = {
      name: 'storybook-iframe-rewrite',
      enforce: 'post',
      transformIndexHtml(html: string, ctx: any) {
        if (ctx && ctx.path === '/iframe.html') {
          return html.replace(
            'virtual:/@storybook/builder-vite/vite-app.js',
            '/@id/__x00__virtual:/@storybook/builder-vite/vite-app.js'
          );
        }
        return html;
import type { StorybookConfig } from "@storybook/react-vite";
    };

    viteConfig.plugins.push(iframeRewritePlugin as any);

    return viteConfig;
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
  async viteFinal(viteConfig, { configType }) {
    const workspaceRoot = path.resolve(__dirname, '../../..');

    // Ensure server.fs.allow includes the workspace root so Vite can serve
    // symlinked packages in a pnpm workspace.
    viteConfig.server = viteConfig.server || {};
    viteConfig.server.fs = viteConfig.server.fs || {};
    viteConfig.server.fs.allow = Array.from(new Set([...(viteConfig.server.fs.allow || []), workspaceRoot]));
    // allow CORS so the iframe can fetch modules
    viteConfig.server.cors = true;

    // Resolve dedupe to avoid duplicate React copies
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.dedupe = Array.from(new Set([...(viteConfig.resolve.dedupe || []), 'react', 'react-dom']));

    // Optimize deps for speed and JSX handling
    viteConfig.optimizeDeps = viteConfig.optimizeDeps || {};
    viteConfig.optimizeDeps.include = Array.from(new Set([...(viteConfig.optimizeDeps.include || []), 'react', 'react-dom']));
    viteConfig.optimizeDeps.esbuildOptions = {
      ...(viteConfig.optimizeDeps.esbuildOptions || {}),
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    };

    // Build commonjs options for monorepo
    viteConfig.build = viteConfig.build || {};
    viteConfig.build.commonjsOptions = {
      ...(viteConfig.build.commonjsOptions || {}),
      include: [/node_modules/, /packages/],
    };

    // Ensure we append the React plugin while preserving Storybook's plugins
    viteConfig.plugins = Array.isArray(viteConfig.plugins) ? viteConfig.plugins : [];
    // Only add react plugin if not already present
    if (!viteConfig.plugins.some((p: any) => p && p.name && p.name.includes('plugin-react'))) {
      viteConfig.plugins.push(react());
    }
      },
    });
  },
};

export default config;

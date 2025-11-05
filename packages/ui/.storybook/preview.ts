import "../src/styles/tailwind.css"; // Re-enabled
import type { Preview } from "@storybook/react";
import { KomabiThemeProvider } from "../src/theme/useTheme";
import React from 'react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: { expanded: true },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <KomabiThemeProvider>
        <div className="bg-background text-foreground p-4">
            <Story />
        </div>
      </KomabiThemeProvider>
    ),
  ],
};

export default preview;

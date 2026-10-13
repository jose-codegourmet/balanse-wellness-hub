import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../packages/ui/src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      // Match before the broad @ alias; never freeze the real application clock.
      "@/lib/clock": path.resolve(dirname, "mock-clock.ts"),
      ...config.resolve.alias,
      "@": path.resolve(dirname, "../src"),
      // Real HTTP has no server in a story; stories keep using getMockAdapter().
      "@balanse/api-client/browser": path.resolve(dirname, "mock-api-fetch-browser.ts"),
    };
    return config;
  },
};

export default config;

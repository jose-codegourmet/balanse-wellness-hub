import "../src/app/globals.css";
import "../src/app/(public)/marketing.css";
import type { Preview } from "@storybook/nextjs-vite";
import { Providers } from "../src/modules/providers/Providers";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground">
        <Providers>
          <Story />
        </Providers>
      </div>
    ),
  ],
  parameters: {
    a11y: {
      test: "error",
    },
  },
};

export default preview;

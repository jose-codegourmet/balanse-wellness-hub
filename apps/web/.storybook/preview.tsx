import "../src/app/globals.css";
import "../src/app/(public)/marketing.css";
import { BALANSE_BREAKPOINT_LABELS, BALANSE_BREAKPOINTS } from "@balanse/config";
import type { Preview } from "@storybook/nextjs-vite";
import { Providers } from "../src/modules/providers/Providers";

const balanseViewports = {
  mobile: {
    name: BALANSE_BREAKPOINT_LABELS.mobile,
    styles: { width: `${BALANSE_BREAKPOINTS.mobile}px`, height: "800px" },
  },
  tablet: {
    name: BALANSE_BREAKPOINT_LABELS.tablet,
    styles: { width: `${BALANSE_BREAKPOINTS.tablet}px`, height: "1024px" },
  },
  desktop: {
    name: BALANSE_BREAKPOINT_LABELS.desktop,
    styles: { width: `${BALANSE_BREAKPOINTS.desktop}px`, height: "900px" },
  },
};

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
    // `Providers` and several portal screens call `useRouter` from
    // `next/navigation`, which throws unless the App Router mock is on.
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      options: balanseViewports,
      viewports: balanseViewports,
    },
  },
};

export default preview;

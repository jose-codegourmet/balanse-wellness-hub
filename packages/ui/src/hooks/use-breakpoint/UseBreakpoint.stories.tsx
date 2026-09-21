import { BALANSE_BREAKPOINTS } from "@balanse/config";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useBreakpoint, useIsMobile, useMinWidth } from "./UseBreakpoint";
import { useBreakpointDefaultValues } from "./UseBreakpoint.defaults";
import type { UseBreakpointProps } from "./UseBreakpoint.schema";

function UseBreakpointReadout({ className }: UseBreakpointProps) {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const tabletUp = useMinWidth(BALANSE_BREAKPOINTS.tablet);
  const desktopUp = useMinWidth(BALANSE_BREAKPOINTS.desktop);
  return (
    <dl className={className} data-breakpoint={breakpoint}>
      <div className="flex justify-between gap-4">
        <dt>useBreakpoint()</dt>
        <dd>{breakpoint}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>useIsMobile()</dt>
        <dd>{isMobile ? "true" : "false"}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>useMinWidth(768)</dt>
        <dd>{tabletUp ? "true" : "false"}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>useMinWidth(1280)</dt>
        <dd>{desktopUp ? "true" : "false"}</dd>
      </div>
    </dl>
  );
}

const meta: Meta<typeof UseBreakpointReadout> = {
  title: "Foundation/UseBreakpoint",
  component: UseBreakpointReadout,
  tags: ["autodocs"],
  args: { ...useBreakpointDefaultValues },
  parameters: {
    docs: {
      description: {
        component:
          "Hook has no rendered UI. This readout is story-only — expected values: mobile at 360, tablet at 768, desktop at 1280.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

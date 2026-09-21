import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMediaQuery } from "./UseMediaQuery";
import { useMediaQueryDefaultValues } from "./UseMediaQuery.defaults";
import type { UseMediaQueryProps } from "./UseMediaQuery.schema";

function UseMediaQueryReadout({ query }: UseMediaQueryProps) {
  const matches = useMediaQuery(query);
  return (
    <p className="text-sm text-foreground">
      <code>{query}</code>
      {": "}
      <span data-matches={matches ? "true" : "false"}>
        {matches ? "matches" : "does not match"}
      </span>
    </p>
  );
}

const meta: Meta<typeof UseMediaQueryReadout> = {
  title: "Foundation/UseMediaQuery",
  component: UseMediaQueryReadout,
  tags: ["autodocs"],
  args: { ...useMediaQueryDefaultValues },
  parameters: {
    docs: {
      description: {
        component:
          "Hook has no rendered UI. This readout is story-only — switch the 360 / 768 / 1280 viewport presets to see the value update live.",
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

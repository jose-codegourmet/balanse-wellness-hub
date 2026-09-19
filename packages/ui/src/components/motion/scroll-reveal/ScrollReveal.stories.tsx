import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MotionConfig } from "framer-motion";
import type { ComponentProps } from "react";
import { ScrollReveal } from "./ScrollReveal";

const meta: Meta<typeof ScrollReveal> = {
  title: "Motion/ScrollReveal",
  component: ScrollReveal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ScrollReveal>;

function RevealDemo(args: ComponentProps<typeof ScrollReveal>) {
  return (
    <div className="space-y-24 py-8">
      <p className="text-muted-foreground text-sm">Scroll down to see the reveal effect.</p>
      <div className="h-48" />
      <ScrollReveal {...args}>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-xl font-semibold">Revealed content</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This block animates into view with a subtle fade and slide.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <RevealDemo {...args} />,
};

export const FromLeft: Story = {
  args: {
    direction: "left",
  },
  render: (args) => <RevealDemo {...args} />,
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
  render: (args) => <RevealDemo {...args} />,
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Bubble, BubbleContent } from "./Bubble";

const meta: Meta<typeof Bubble> = {
  title: "Components/Bubble",
  component: Bubble,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Bubble>;

export const Default: Story = {
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>Hey! Are we still on for the playdate tomorrow?</BubbleContent>
    </Bubble>
  ),
};

export const Secondary: Story = {
  render: (args) => (
    <Bubble {...args} variant="secondary">
      <BubbleContent>Your match request was sent successfully.</BubbleContent>
    </Bubble>
  ),
};

export const EndAligned: Story = {
  render: (args) => (
    <Bubble {...args} align="end" variant="muted">
      <BubbleContent>Sounds great — see you at the park!</BubbleContent>
    </Bubble>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Bubble {...args} variant="destructive">
      <BubbleContent>Unable to deliver this message. Please try again.</BubbleContent>
    </Bubble>
  ),
};

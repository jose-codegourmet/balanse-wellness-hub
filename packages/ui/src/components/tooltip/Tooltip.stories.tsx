import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
};

export const Open: Story = {
  render: (args) => (
    <Tooltip {...args} defaultOpen>
      <TooltipTrigger render={<Button variant="outline" />}>Tooltip open</TooltipTrigger>
      <TooltipContent>This tooltip starts open for documentation.</TooltipContent>
    </Tooltip>
  ),
};

export const SideBottom: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Bottom tooltip</TooltipTrigger>
      <TooltipContent side="bottom">Displayed below the trigger</TooltipContent>
    </Tooltip>
  ),
};

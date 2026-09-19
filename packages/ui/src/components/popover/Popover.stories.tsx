import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";
import { Input } from "../input/Input";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="text-sm text-muted-foreground">
          Place content here such as settings, filters, or quick actions.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const Open: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>Dimensions</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="width" className="text-sm font-medium">
              Width
            </label>
            <Input id="width" defaultValue="100%" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="height" className="text-sm font-medium">
              Height
            </label>
            <Input id="height" defaultValue="25px" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithHeader: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>Share profile</PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Share link</PopoverTitle>
          <PopoverDescription>
            Anyone with this link can view your class profile.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex gap-2">
          <Input readOnly defaultValue="https://balanse.app/p/bailey" />
          <Button size="sm">Copy</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

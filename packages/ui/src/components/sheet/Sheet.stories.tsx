import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./Sheet";

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when done.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: (args) => (
    <Sheet {...args} defaultOpen>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse sections from the left side panel.</SheetDescription>
        </SheetHeader>
        <div className="px-4 text-sm text-muted-foreground">Home, Matches, Messages, Settings</div>
      </SheetContent>
    </Sheet>
  ),
};

export const Right: Story = {
  render: (args) => (
    <Sheet {...args} defaultOpen>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Adjust your search preferences for nearby classes.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button>Apply filters</Button>
          <Button variant="outline">Reset</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Open: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <Sheet {...args}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            This sheet is shown in its open state for documentation.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

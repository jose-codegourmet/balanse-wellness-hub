import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area for details, metrics, or supporting copy.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Review your latest updates and mark items as read.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm">
          Dismiss
        </Button>
        <Button size="sm">View all</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <div
        role="img"
        aria-label="Balansé"
        className="aspect-video w-full bg-muted/30 bg-[url('/images/brand/logo-balanse-primary.png')] bg-contain bg-center bg-no-repeat p-6"
      />
      <CardHeader>
        <CardTitle>Featured product</CardTitle>
        <CardDescription>Cards support a leading image out of the box.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Use this layout for blog previews, product cards, or media highlights.</p>
      </CardContent>
    </Card>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <Card {...args} className="w-[280px]">
      <CardHeader>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            ⋯
          </Button>
        </CardAction>
        <CardTitle>Compact card</CardTitle>
        <CardDescription>Smaller spacing for dense layouts.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Ideal for sidebars, lists, and dashboard widgets.</p>
      </CardContent>
    </Card>
  ),
};

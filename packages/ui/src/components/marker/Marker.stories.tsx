import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoIcon } from "lucide-react";

import { Marker, MarkerContent, MarkerIcon } from "./Marker";

const meta: Meta<typeof Marker> = {
  title: "Components/Marker",
  component: Marker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Marker>;

export const Default: Story = {
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <InfoIcon />
      </MarkerIcon>
      <MarkerContent>Updated 2 hours ago</MarkerContent>
    </Marker>
  ),
};

export const Separator: Story = {
  render: (args) => (
    <Marker {...args} variant="separator">
      <MarkerContent>Section divider</MarkerContent>
    </Marker>
  ),
};

export const Border: Story = {
  render: (args) => (
    <Marker {...args} variant="border">
      <MarkerIcon>
        <InfoIcon />
      </MarkerIcon>
      <MarkerContent>Important notice about your account settings</MarkerContent>
    </Marker>
  ),
};

export const WithLink: Story = {
  render: (args) => (
    <Marker {...args}>
      <MarkerContent>
        Learn more in our <a href="/help">help center</a>
      </MarkerContent>
    </Marker>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the cli.</AlertDescription>
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <InfoIcon />
      <AlertTitle>New matches available</AlertTitle>
      <AlertDescription>
        Three members near you are looking for playdates this weekend.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Alert {...args} variant="destructive" className="max-w-lg">
      <InfoIcon />
      <AlertTitle>Unable to save changes</AlertTitle>
      <AlertDescription>Your session expired. Please sign in again and retry.</AlertDescription>
    </Alert>
  ),
};

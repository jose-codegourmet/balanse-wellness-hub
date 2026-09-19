import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";

import { Button } from "../button/Button";

import { Toaster } from "./Sonner";

const meta: Meta<typeof Toaster> = {
  title: "Components/Sonner",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <Button onClick={() => toast("Your changes have been saved.")}>Show toast</Button>
      <Toaster />
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        onClick={() =>
          toast.success("Profile updated", {
            description: "Your class profile is now live.",
          })
        }
      >
        Show success
      </Button>
      <Toaster />
    </div>
  ),
};

export const ErrorToast: Story = {
  render: () => (
    <div className="space-y-4">
      <Button
        variant="destructive"
        onClick={() =>
          toast.error("Something went wrong", {
            description: "Please try again in a few moments.",
          })
        }
      >
        Show error
      </Button>
      <Toaster />
    </div>
  ),
};

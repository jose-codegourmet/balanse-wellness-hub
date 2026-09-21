import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CancellationForm } from "./CancellationForm";

const meta: Meta<typeof CancellationForm> = {
  title: "Portal/Cancellation form",
  component: CancellationForm,
  tags: ["autodocs"],
  args: { submitting: false, onSubmit: () => undefined },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};

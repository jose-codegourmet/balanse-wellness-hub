import { bookings } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleForm } from "./RescheduleForm";

const booking = bookings.find((entry) => entry.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Portal/Reschedule form",
  component: RescheduleForm,
  parameters: { layout: "fullscreen" },
  args: { booking },
} satisfies Meta<typeof RescheduleForm>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

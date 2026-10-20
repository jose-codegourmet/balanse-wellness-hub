import { bookings, MOCK_NOW_ISO } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RescheduleForm } from "./RescheduleForm";

const booking = bookings.find((entry) => entry.status === "CONFIRMED") ?? bookings[0];

const meta = {
  title: "Portal/Reschedule form",
  component: RescheduleForm,
  parameters: { layout: "fullscreen" },
  args: { booking, nowIso: MOCK_NOW_ISO },
} satisfies Meta<typeof RescheduleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fixture clock: only sessions the customer can still request are listed, nearest first. */
export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: "mobile", isRotated: false } } };

/** A clock after the last fixture session: the eight-week window holds nothing requestable. */
export const Empty: Story = { args: { nowIso: "2027-03-01T00:00:00.000Z" } };

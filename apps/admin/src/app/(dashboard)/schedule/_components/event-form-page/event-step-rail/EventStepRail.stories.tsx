import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventStepRail } from "./EventStepRail";

const meta = {
  title: "Admin/Screens/Event form/Step rail",
  component: EventStepRail,
  tags: ["autodocs"],
  args: {
    onSelect: () => {},
    steps: [
      { id: "session", title: "Session", hint: "Pick the slot", status: "complete" },
      { id: "story", title: "Story", hint: "Title, copy, and cause", status: "current" },
      { id: "look", title: "Look", hint: "Poster and gallery", status: "locked" },
      { id: "logistics", title: "Logistics", hint: "Venue and registration", status: "locked" },
      { id: "review", title: "Review", hint: "Check and publish", status: "locked" },
    ],
  },
} satisfies Meta<typeof EventStepRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const EditWithError: Story = {
  args: {
    steps: [
      { id: "story", title: "Story", hint: "Title, copy, and cause", status: "error" },
      { id: "look", title: "Look", hint: "Poster and gallery", status: "complete" },
      { id: "logistics", title: "Logistics", hint: "Venue and registration", status: "current" },
      { id: "review", title: "Review", hint: "Check and save", status: "upcoming" },
    ],
  },
};

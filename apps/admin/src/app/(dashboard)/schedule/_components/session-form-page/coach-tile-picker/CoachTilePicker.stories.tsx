import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CoachTilePicker } from "./CoachTilePicker";
import type { CoachTilePickerProps } from "./CoachTilePicker.meta";

const coach = (id: string, name: string, specialties: string[], active = true) => ({
  id,
  name,
  specialties,
  shortBio: "",
  photoKey: null,
  active,
  defaultRatePhp: 600,
  rateType: "PER_SESSION" as const,
  staffId: null,
});

function Harness(props: Omit<CoachTilePickerProps, "onChange">) {
  const [value, setValue] = useState<string[]>([...props.value]);
  return <CoachTilePicker {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: "Admin/Screens/SessionForm/Coach tile picker",
  component: Harness,
  tags: ["autodocs"],
  args: {
    value: ["coach-wolf"],
    recommendedIds: ["coach-wolf", "coach-kate"],
    coaches: [
      coach("coach-wolf", "Wolf", ["Yoga"]),
      coach("coach-kate", "Kate Go", ["Yoga"]),
      coach("coach-rex", "Rex Francis Regis", ["Calisthenics", "Mat Pilates"]),
      coach("coach-jodi", "Jodi Tio", ["Mat Pilates"], false),
    ],
  },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BusyCoach: Story = {
  args: { busy: new Map([["coach-kate", "Yoga at 8:00 AM"]]) },
};

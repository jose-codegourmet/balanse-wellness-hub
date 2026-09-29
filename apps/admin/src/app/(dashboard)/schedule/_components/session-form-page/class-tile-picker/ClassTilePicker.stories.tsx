import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ClassTilePicker } from "./ClassTilePicker";
import type { ClassTilePickerProps } from "./ClassTilePicker.meta";

const base = {
  slug: "",
  shortDescription: "",
  description: "",
  coachIds: [],
  galleryImages: [],
  active: true,
};

function Harness(props: Omit<ClassTilePickerProps, "onChange">) {
  const [value, setValue] = useState(props.value);
  return <ClassTilePicker {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: "Admin/Screens/SessionForm/Class tile picker",
  component: Harness,
  tags: ["autodocs"],
  args: {
    value: "class-yoga",
    classes: [
      {
        ...base,
        id: "class-yoga",
        name: "Yoga",
        heroImage: "/assets/marketing/classes/dance-fitness-hero.webp",
        defaultDurationMinutes: 60,
        defaultPricePhp: 550,
      },
      {
        ...base,
        id: "class-pilates",
        name: "Mat Pilates",
        heroImage: "/assets/marketing/classes/circuit-training-hero.webp",
        defaultDurationMinutes: 90,
        defaultPricePhp: 650,
      },
      {
        ...base,
        id: "class-open",
        name: "Open Studio",
        heroImage: null,
        defaultDurationMinutes: null,
        defaultPricePhp: null,
      },
    ],
  },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = { args: { value: "", invalid: true } };

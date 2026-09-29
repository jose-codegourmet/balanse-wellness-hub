import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Chip, chipVariants } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  args: { children: "8 AM" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { selected: true } };

export const TimeSlots: Story = {
  render: () => {
    const slots = ["8 AM", "9:30 AM", "11 AM", "3 PM", "6 PM"];
    const [value, setValue] = useState("8 AM");
    return (
      <div className="flex flex-wrap gap-1.5">
        {slots.map((slot) => (
          <Chip key={slot} selected={slot === value} onClick={() => setValue(slot)}>
            {slot}
          </Chip>
        ))}
      </div>
    );
  },
};

export const WeekdaySquares: Story = {
  render: () => {
    const [days, setDays] = useState(["We"]);
    return (
      <div className="flex gap-1.5">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <Chip
            key={day}
            size="square"
            selected={days.includes(day)}
            onClick={() =>
              setDays((current) =>
                current.includes(day) ? current.filter((row) => row !== day) : [...current, day],
              )
            }
          >
            {day}
          </Chip>
        ))}
      </div>
    );
  },
};

export const RadioLabels: Story = {
  render: () => {
    const [value, setValue] = useState("none");
    return (
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Repeat</legend>
        {["none", "weekly", "custom"].map((option) => (
          <label key={option} className={chipVariants({ selected: value === option })}>
            <input
              type="radio"
              name="repeat"
              className="sr-only"
              checked={value === option}
              onChange={() => setValue(option)}
            />
            {option === "none" ? "Does not repeat" : option === "weekly" ? "Weekly" : "Custom days"}
          </label>
        ))}
      </fieldset>
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };

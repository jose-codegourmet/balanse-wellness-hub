import { coachPhotoKey } from "@balanse/domain";
import {
  CheckboxGroupItem,
  CheckboxGroup as CoachCheckboxGroup,
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CoachOption, toCoachChoiceOption } from "./CoachOption";
import {
  coachOptionAlec,
  coachOptionDefaultValues,
  coachOptionInactive,
  coachOptionKate,
  coachOptionRex,
  coachOptionSofia,
} from "./CoachOption.defaults";
import type { CoachOptionCoach } from "./CoachOption.schema";

const roster: CoachOptionCoach[] = [
  coachOptionRex,
  {
    id: "coach-ephraim",
    name: "Ephraim Bacaltos",
    photoKey: coachPhotoKey("ephraim-bacaltos"),
    specialties: ["Circuit Training", "Groundworks", "Calisthenics"],
    active: true,
  },
  {
    id: "coach-rachelle",
    name: "Rachelle Tobiano",
    photoKey: coachPhotoKey("rachelle-tobiano"),
    specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"],
    active: true,
  },
  coachOptionAlec,
  {
    id: "coach-jodi",
    name: "Jodi Tio",
    photoKey: coachPhotoKey("jodi-tio"),
    specialties: ["Mat Pilates"],
    active: true,
  },
  {
    id: "coach-wolf",
    name: "Wolf",
    photoKey: coachPhotoKey("wolf"),
    specialties: ["Yoga"],
    active: true,
  },
  coachOptionKate,
  coachOptionSofia,
  {
    id: "coach-mikaela",
    name: "Mikaela Danielle",
    photoKey: coachPhotoKey("mikaela-danielle"),
    specialties: ["Dance Fitness"],
    active: true,
  },
  {
    id: "coach-maris",
    name: "Maris Cabrera",
    photoKey: coachPhotoKey("maris-cabrera"),
    specialties: ["Dance Fitness"],
    active: true,
  },
  {
    id: "coach-francis",
    name: "Francis Acido",
    photoKey: coachPhotoKey("francis-acido"),
    specialties: ["Dance Fitness"],
    active: true,
  },
  coachOptionInactive,
];

function CoachPickerDemo({
  coaches,
  includeAll = false,
}: {
  coaches: CoachOptionCoach[];
  includeAll?: boolean;
}) {
  const options = [
    ...(includeAll ? [{ value: "all", label: "All coaches" }] : []),
    ...coaches.map(toCoachChoiceOption),
  ];
  const [value, setValue] = useState(options[0] ?? null);

  return (
    <div className="max-w-sm">
      <Combobox
        items={options}
        value={value}
        onValueChange={setValue}
        itemToStringLabel={(item) => [item.label, item.description].filter(Boolean).join(" ")}
      >
        <ComboboxInput placeholder="Search coach…" leading={value?.leading} showClear />
        <ComboboxContent>
          <ComboboxEmpty>No coach found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxCollection>
              {(item) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  leading={item.leading}
                  description={item.description}
                >
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

const meta: Meta<typeof CoachOption> = {
  title: "Admin/Components/CoachOption",
  component: CoachOption,
  tags: ["autodocs"],
  args: coachOptionDefaultValues,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Headshot: Story = {};

export const PlaceholderAlec: Story = {
  args: { coach: coachOptionAlec },
};

export const PlaceholderSofia: Story = {
  args: { coach: coachOptionSofia },
};

export const PlaceholderKate: Story = {
  args: { coach: coachOptionKate },
};

export const InactiveRow: Story = {
  args: { coach: coachOptionInactive, layout: "row" },
};

export const PickerHeadshots: Story = {
  render: () => <CoachPickerDemo coaches={roster.filter((coach) => coach.photoKey)} />,
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const PickerPlaceholders: Story = {
  render: () => <CoachPickerDemo coaches={[coachOptionAlec, coachOptionSofia, coachOptionKate]} />,
};

export const EmptyRoster: Story = {
  render: () => <CoachPickerDemo coaches={[]} />,
};

export const LongRoster360: Story = {
  render: () => <CoachPickerDemo coaches={roster} includeAll />,
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const LongRoster768: Story = {
  render: () => <CoachPickerDemo coaches={roster} includeAll />,
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const LongRoster1280: Story = {
  render: () => <CoachPickerDemo coaches={roster} includeAll />,
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const DarkTheme: Story = {
  render: () => <CoachPickerDemo coaches={roster} />,
  globals: { theme: "dark" },
};

export const MultiAssign: Story = {
  render: () => (
    <CoachCheckboxGroup>
      {roster.slice(0, 4).map((coach) => {
        const option = toCoachChoiceOption(coach);
        return (
          <CheckboxGroupItem
            key={option.value}
            label={option.label}
            leading={option.leading}
            description={option.description}
          />
        );
      })}
    </CoachCheckboxGroup>
  ),
};

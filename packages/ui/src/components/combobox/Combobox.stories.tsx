import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ReactNode, useState } from "react";

import { Avatar, AvatarFallback } from "../avatar/Avatar";
import type { ChoiceOption } from "../option-row/OptionRow.schema";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./Combobox";
import { comboboxDefaultValues } from "./Combobox.defaults";

const frameworks = ["Next.js", "React", "Vue", "Svelte", "Astro"];

const coaches: ChoiceOption[] = [
  { value: "maya", label: "Maya Santos", description: "Reformer · senior" },
  { value: "lina", label: "Lina Cruz", description: "Tower · weekend" },
  { value: "jon", label: "Jon Reyes", description: "Mat · mornings", disabled: true },
];

function CoachMark({ initials }: { initials: string }) {
  return (
    <Avatar size="sm" className="size-7">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

const LEADING: Record<string, ReactNode> = {
  maya: <CoachMark initials="MS" />,
  lina: <CoachMark initials="LC" />,
  jon: <CoachMark initials="JR" />,
};

const meta: Meta<typeof Combobox> = {
  title: "Components/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: { ...comboboxDefaultValues },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Select framework..." />
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithClear: Story = {
  render: () => (
    <Combobox items={frameworks} defaultValue="React">
      <ComboboxInput placeholder="Select framework..." showClear />
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Combobox items={frameworks} disabled>
      <ComboboxInput placeholder="Select framework..." disabled />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithoutTrigger: Story = {
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Search frameworks..." showTrigger={false} />
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

function RichComboboxDemo() {
  const [value, setValue] = useState<ChoiceOption | null>(coaches[0] ?? null);
  return (
    <div className="max-w-sm">
      <Combobox
        items={coaches}
        value={value}
        onValueChange={setValue}
        itemToStringLabel={(item) => item.label}
      >
        <ComboboxInput
          placeholder="Search coaches…"
          leading={value ? LEADING[value.value] : null}
        />
        <ComboboxContent>
          <ComboboxEmpty>No coach found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxCollection>
              {(item) => (
                <ComboboxItem
                  key={item.value}
                  value={item}
                  leading={LEADING[item.value]}
                  description={item.description}
                  disabled={item.disabled}
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

export const RichOptions: Story = {
  render: () => <RichComboboxDemo />,
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const RichOptionsDark: Story = {
  render: () => (
    <div className="dark bg-background p-4 text-foreground">
      <RichComboboxDemo />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const RichOptionsDesktop: Story = {
  render: () => <RichComboboxDemo />,
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

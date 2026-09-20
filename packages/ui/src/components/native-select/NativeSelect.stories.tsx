import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, FieldLabel } from "../field/Field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./NativeSelect";
import { nativeSelectDefaultValues } from "./NativeSelect.defaults";

const meta: Meta<typeof NativeSelect> = {
  title: "Components/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  args: { ...nativeSelectDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

function FruitOptions() {
  return (
    <>
      <NativeSelectOption value="small">Small</NativeSelectOption>
      <NativeSelectOption value="medium">Medium</NativeSelectOption>
      <NativeSelectOption value="large">Large</NativeSelectOption>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <NativeSelect {...args}>
      <FruitOptions />
    </NativeSelect>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <NativeSelect {...args} size="sm">
        <FruitOptions />
      </NativeSelect>
      <NativeSelect {...args} size="md">
        <FruitOptions />
      </NativeSelect>
      <NativeSelect {...args} size="lg">
        <FruitOptions />
      </NativeSelect>
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
  render: (args) => (
    <Field invalid>
      <FieldLabel>Class size</FieldLabel>
      <NativeSelect {...args}>
        <FruitOptions />
      </NativeSelect>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <NativeSelect {...args}>
      <FruitOptions />
    </NativeSelect>
  ),
};

export const Grouped: Story = {
  args: {
    defaultValue: "dog",
  },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOptGroup label="Pets">
        <NativeSelectOption value="dog">Dog</NativeSelectOption>
        <NativeSelectOption value="cat">Cat</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Other">
        <NativeSelectOption value="bird">Bird</NativeSelectOption>
        <NativeSelectOption value="rabbit">Rabbit</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

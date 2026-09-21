import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "../checkbox/Checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../combobox/Combobox";
import { DatePicker } from "../date-picker/DatePicker";
import { Input } from "../input/Input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group/InputGroup";
import { NativeSelect, NativeSelectOption } from "../native-select/NativeSelect";
import { RadioGroup, RadioGroupItem } from "../radio-group/RadioGroup";
import { RichTextarea } from "../rich-textarea/RichTextarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/Select";
import { Switch } from "../switch/Switch";
import { Textarea } from "../textarea/Textarea";
import { TimePicker } from "../time-picker/TimePicker";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./Field";
import { fieldDefaultValues } from "./Field.defaults";

function GalleryFields({
  invalid = false,
  disabled = false,
}: {
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <FieldGroup className="w-full">
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>Input</FieldLabel>
        <Input placeholder="Full width" defaultValue="Maya Santos" />
        <FieldDescription>Label → control → description → error.</FieldDescription>
        {invalid ? <FieldError>This field is required.</FieldError> : null}
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>NativeSelect</FieldLabel>
        <NativeSelect defaultValue="reformer">
          <NativeSelectOption value="reformer">Reformer</NativeSelectOption>
          <NativeSelectOption value="tower">Tower</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>Select</FieldLabel>
        <Select defaultValue="reformer">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reformer">Reformer</SelectItem>
            <SelectItem value="tower">Tower</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>Combobox</FieldLabel>
        <Combobox items={["Reformer", "Tower"]} defaultValue="Reformer">
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="Reformer">Reformer</ComboboxItem>
              <ComboboxItem value="Tower">Tower</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>DatePicker</FieldLabel>
        <DatePicker defaultValue="2026-09-21" />
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>TimePicker</FieldLabel>
        <TimePicker defaultValue="09:00" />
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>InputGroup</FieldLabel>
        <InputGroup>
          <InputGroupAddon>+63</InputGroupAddon>
          <InputGroupInput placeholder="900 000 0000" />
        </InputGroup>
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>Textarea</FieldLabel>
        <Textarea placeholder="Notes" />
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>RichTextarea</FieldLabel>
        <RichTextarea defaultValue="Studio notes" minRows={3} />
      </Field>
      <Field orientation="horizontal" invalid={invalid} disabled={disabled}>
        <Switch defaultChecked />
        <FieldLabel>Active</FieldLabel>
        <FieldDescription>Horizontal switch row — description wraps full width.</FieldDescription>
      </Field>
      <Field orientation="horizontal" invalid={invalid} disabled={disabled}>
        <Checkbox defaultChecked />
        <FieldLabel>Email waitlist openings</FieldLabel>
      </Field>
      <Field invalid={invalid} disabled={disabled}>
        <FieldLabel>Radio</FieldLabel>
        <RadioGroup defaultValue="a">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="a" id="gallery-a" />
            <label htmlFor="gallery-a">Option A</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="b" id="gallery-b" />
            <label htmlFor="gallery-b">Option B</label>
          </div>
        </RadioGroup>
      </Field>
    </FieldGroup>
  );
}

const meta: Meta<typeof Field> = {
  title: "Components/Field/Gallery",
  component: Field,
  tags: ["autodocs"],
  args: { ...fieldDefaultValues },
  parameters: {
    a11y: { disable: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FieldGalleryStacked: Story = {
  name: "Stacked — light",
  render: () => (
    <div className="max-w-xl bg-background p-4 text-foreground">
      <GalleryFields />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const FieldGalleryStackedDark: Story = {
  name: "Stacked — dark",
  render: () => (
    <div className="dark max-w-xl bg-background p-4 text-foreground">
      <GalleryFields />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const FieldGalleryGrid: Story = {
  name: "Two-column grid — light",
  render: () => (
    <div className="bg-background p-4 text-foreground">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Input</FieldLabel>
          <Input defaultValue="Aligned" />
        </Field>
        <Field>
          <FieldLabel>NativeSelect</FieldLabel>
          <NativeSelect defaultValue="a">
            <NativeSelectOption value="a">Aligned</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel>Select</FieldLabel>
          <Select defaultValue="a">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Aligned</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Combobox</FieldLabel>
          <Combobox items={["Aligned"]} defaultValue="Aligned">
            <ComboboxInput />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="Aligned">Aligned</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        <Field>
          <FieldLabel>DatePicker</FieldLabel>
          <DatePicker defaultValue="2026-09-21" />
        </Field>
        <Field>
          <FieldLabel>TimePicker</FieldLabel>
          <TimePicker defaultValue="09:00" />
        </Field>
      </div>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const FieldGalleryGridDark: Story = {
  name: "Two-column grid — dark",
  render: () => (
    <div className="dark bg-background p-4 text-foreground">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field invalid>
          <FieldLabel>Input</FieldLabel>
          <Input defaultValue="Invalid" />
          <FieldError>Match the red ring across the row.</FieldError>
        </Field>
        <Field invalid>
          <FieldLabel>NativeSelect</FieldLabel>
          <NativeSelect defaultValue="a">
            <NativeSelectOption value="a">Invalid</NativeSelectOption>
          </NativeSelect>
          <FieldError>Match the red ring across the row.</FieldError>
        </Field>
        <Field invalid>
          <FieldLabel>Select</FieldLabel>
          <Select defaultValue="a">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Invalid</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field invalid>
          <FieldLabel>DatePicker</FieldLabel>
          <DatePicker defaultValue="2026-09-21" />
        </Field>
        <Field invalid>
          <FieldLabel>TimePicker</FieldLabel>
          <TimePicker defaultValue="09:00" />
        </Field>
        <Field invalid>
          <FieldLabel>Combobox</FieldLabel>
          <Combobox items={["Invalid"]} defaultValue="Invalid">
            <ComboboxInput />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="Invalid">Invalid</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </div>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const FieldGalleryDisabled: Story = {
  name: "Disabled — light + dark",
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-background p-4 text-foreground">
        <GalleryFields disabled />
      </div>
      <div className="dark bg-background p-4 text-foreground">
        <GalleryFields disabled />
      </div>
    </div>
  ),
};

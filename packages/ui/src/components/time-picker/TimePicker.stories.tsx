import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../button/Button";
import { Field, FieldError, FieldLabel } from "../field/Field";
import { TimePicker } from "./TimePicker";
import { timePickerDefaultValues } from "./TimePicker.defaults";
import { timePickerSchema } from "./TimePicker.schema";

const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  args: { ...timePickerDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { defaultValue: undefined },
  render: (args) => <TimePicker {...args} aria-label="Start time" defaultValue={undefined} />,
};

export const PresetValue: Story = {
  render: (args) => <TimePicker {...args} aria-label="Start time" />,
};

export const MinMaxBounded: Story = {
  args: { after: "08:00", defaultValue: "09:00" },
  render: (args) => <TimePicker {...args} aria-label="End time after 08:00" />,
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: "08:00", after: "08:00" },
  render: (args) => {
    const id = React.useId();
    return (
      <Field data-invalid="true">
        <FieldLabel htmlFor={id}>End time</FieldLabel>
        <TimePicker {...args} id={id} aria-describedby={`${id}-error`} />
        <FieldError id={`${id}-error`}>End time must be after the start time.</FieldError>
      </Field>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "08:00" },
  render: (args) => <TimePicker {...args} aria-label="Disabled start time" />,
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
      viewports: {
        mobile1: { name: "360", styles: { width: "360px", height: "640px" } },
      },
    },
  },
  render: (args) => (
    <div className="w-[360px]">
      <TimePicker {...args} aria-label="Mobile start time" />
    </div>
  ),
};

export const ReactHookFormBound: Story = {
  render: () => {
    function BoundForm() {
      const startId = React.useId();
      const endId = React.useId();
      const form = useForm({
        defaultValues: { start: "08:00", end: "09:00" },
      });
      const start = form.watch("start");
      const [result, setResult] = React.useState<string>("");

      return (
        <form
          className="flex max-w-sm flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            // TODO(FE-SHR-008): swap to zodResolver once @hookform/resolvers is in @balanse/ui.
            const startParsed = timePickerSchema.safeParse(values.start);
            const endParsed = timePickerSchema.safeParse(values.end);
            if (!startParsed.success || !endParsed.success) {
              setResult("Validation failed.");
              return;
            }
            setResult(`${startParsed.data}–${endParsed.data}`);
          })}
        >
          <Controller
            control={form.control}
            name="start"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={startId}>Start</FieldLabel>
                <TimePicker
                  id={startId}
                  value={field.value || undefined}
                  onValueChange={(next) => field.onChange(next ?? "")}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${startId}-error` : undefined}
                />
                <FieldError id={`${startId}-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="end"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={endId}>End</FieldLabel>
                <TimePicker
                  id={endId}
                  after={start || undefined}
                  value={field.value || undefined}
                  onValueChange={(next) => field.onChange(next ?? "")}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${endId}-error` : undefined}
                />
                <FieldError id={`${endId}-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button type="submit">Save</Button>
          {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}
        </form>
      );
    }

    return <BoundForm />;
  },
};

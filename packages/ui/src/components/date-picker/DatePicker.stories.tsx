import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../button/Button";
import { Field, FieldError, FieldLabel } from "../field/Field";
import { DatePicker, DateRangePicker } from "./DatePicker";
import { datePickerDefaultValues, dateRangePickerDefaultValues } from "./DatePicker.defaults";
import { datePickerSchema, dateRangeSchema } from "./DatePicker.schema";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  args: { ...datePickerDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { defaultValue: undefined },
  render: (args) => <DatePicker {...args} aria-label="Session date" defaultValue={undefined} />,
};

export const PresetValue: Story = {
  render: (args) => <DatePicker {...args} aria-label="Session date" />,
};

export const RangeWithPresets: Story = {
  render: () => (
    <DateRangePicker {...dateRangePickerDefaultValues} aria-label="Report date range" />
  ),
};

export const MinMaxBounded: Story = {
  args: {
    min: "2026-09-10",
    max: "2026-09-20",
    defaultValue: "2026-09-16",
  },
  render: (args) => <DatePicker {...args} aria-label="Bounded session date" />,
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: "2026-09-16" },
  render: (args) => {
    const id = React.useId();
    return (
      <Field data-invalid="true">
        <FieldLabel htmlFor={id}>Session date</FieldLabel>
        <DatePicker {...args} id={id} aria-describedby={`${id}-error`} />
        <FieldError id={`${id}-error`}>Enter a valid session date.</FieldError>
      </Field>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "2026-09-16" },
  render: (args) => <DatePicker {...args} aria-label="Disabled session date" />,
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
      <DateRangePicker
        {...dateRangePickerDefaultValues}
        aria-label="Mobile date range"
        today={args.today}
      />
    </div>
  ),
};

export const ReactHookFormBound: Story = {
  render: () => {
    function BoundForm() {
      const dateId = React.useId();
      const rangeId = React.useId();
      const form = useForm({
        defaultValues: {
          sessionDate: "2026-09-16",
          reportRange: { from: "2026-09-01", to: "2026-09-16" },
        },
      });
      const [result, setResult] = React.useState<string>("");

      return (
        <form
          className="flex max-w-sm flex-col gap-4"
          onSubmit={form.handleSubmit((values) => {
            // TODO(FE-SHR-008): swap to zodResolver once @hookform/resolvers is in @balanse/ui.
            const dateParsed = datePickerSchema.safeParse(values.sessionDate);
            const rangeParsed = dateRangeSchema.safeParse(values.reportRange);
            if (!dateParsed.success || !rangeParsed.success) {
              setResult("Validation failed.");
              return;
            }
            setResult(`${dateParsed.data} · ${rangeParsed.data.from}–${rangeParsed.data.to}`);
          })}
        >
          <Controller
            control={form.control}
            name="sessionDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={dateId}>Session date</FieldLabel>
                <DatePicker
                  id={dateId}
                  today="2026-09-16"
                  value={field.value || undefined}
                  onValueChange={(next) => field.onChange(next ?? "")}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${dateId}-error` : undefined}
                />
                <FieldError id={`${dateId}-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="reportRange"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={rangeId}>Report range</FieldLabel>
                <DateRangePicker
                  id={rangeId}
                  today="2026-09-16"
                  value={field.value}
                  onValueChange={(next) => field.onChange(next)}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? `${rangeId}-error` : undefined}
                />
                <FieldError id={`${rangeId}-error`} errors={[fieldState.error]} />
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

import { flattenFaqs, teachesBio } from "@balanse/domain";
import { publicContent } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../button/Button";
import { Field, FieldError, FieldLabel } from "../field/Field";
import { RichTextarea } from "./RichTextarea";
import { richTextareaDefaultValues } from "./RichTextarea.defaults";
import type { RichTextareaProps } from "./RichTextarea.schema";
import { richTextareaSchema } from "./RichTextarea.schema";

function LabeledRichTextarea(args: RichTextareaProps) {
  const id = useId();
  return (
    <Field data-invalid={args.invalid || undefined}>
      <FieldLabel htmlFor={id}>About</FieldLabel>
      <RichTextarea {...args} id={id} />
    </Field>
  );
}

const fixtureAbout = publicContent.about;
const fixtureFaq = flattenFaqs()[0];
const fixtureBio = teachesBio(["Calisthenics", "Mat Pilates", "Caliyoga"]);

const seededMarkdown = [
  fixtureAbout,
  "",
  `**${fixtureFaq.question}**`,
  fixtureFaq.answer,
  "",
  `_${fixtureBio}_`,
  "",
  "Visit [Balansé](https://example.com) or email [us](mailto:balanse.wellnesshub@gmail.com).",
  "",
  "- Movement",
  "- Recovery",
  "",
  "1. Book a class",
  "2. Show up",
].join("\n");

const meta: Meta<typeof RichTextarea> = {
  title: "Components/RichTextarea",
  component: RichTextarea,
  tags: ["autodocs"],
  args: { ...richTextareaDefaultValues },
  render: (args) => <LabeledRichTextarea {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    defaultValue: "",
  },
};

export const SeededFromFixture: Story = {
  args: {
    defaultValue: seededMarkdown,
  },
};

export const AtLimit: Story = {
  args: {
    maxLength: fixtureAbout.length,
    defaultValue: fixtureAbout,
  },
};

export const OverLimit: Story = {
  args: {
    maxLength: 80,
    defaultValue: fixtureAbout,
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: fixtureAbout,
  },
  render: (args) => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="rich-textarea-invalid">About</FieldLabel>
      <RichTextarea
        {...args}
        id="rich-textarea-invalid"
        aria-describedby="rich-textarea-invalid-error"
      />
      <FieldError id="rich-textarea-invalid-error">About copy needs a second look.</FieldError>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: fixtureAbout,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: fixtureAbout,
  },
};

export const PreviewOpen: Story = {
  args: {
    preview: true,
    defaultValue: seededMarkdown,
  },
};

export const Mobile: Story = {
  args: {
    defaultValue: seededMarkdown,
  },
  render: (args) => (
    <div className="w-[360px]">
      <LabeledRichTextarea {...args} />
    </div>
  ),
};

export const ReactHookFormBound: Story = {
  render: () => {
    function BoundForm() {
      const form = useForm<{ about: string }>({
        defaultValues: { about: fixtureAbout },
      });

      return (
        <form
          className="flex max-w-xl flex-col gap-3"
          onSubmit={form.handleSubmit((values) => {
            // TODO(FE-SHR-008): use zodResolver once @hookform/resolvers is in packages/ui
            richTextareaSchema.safeParse(values.about);
          })}
        >
          <Controller
            control={form.control}
            name="about"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="rich-textarea-rhf">About</FieldLabel>
                <RichTextarea
                  id="rich-textarea-rhf"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? "rich-textarea-rhf-error" : undefined}
                />
                <FieldError id="rich-textarea-rhf-error">{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      );
    }

    return <BoundForm />;
  },
};

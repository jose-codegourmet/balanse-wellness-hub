# AdminForm — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Admin form kit: `useForm` + `zodResolver` + the `@balanse/ui` `Field` family. Screens do not call `useForm` themselves.

## When to use

- Every new admin write form (class, coach, session, settings)
- Storybook states that need submit / invalid / root error

## When NOT to use

- Read-only pages and queues
- Coach / session / settings **UI** until those tickets convert — they consume the stub schemas only
- Do not invent a third form family (`FormMessage` vs `FieldError`)

## Examples

```tsx
<AdminForm schema={classFormSchema} defaultValues={classFormDefaultValues} onSubmit={onSubmit}>
  <FormField name="name" label="Class name">
    {(field) => <TextBinding {...field} />}
  </FormField>
  <FormActions submitLabel="Save" />
</AdminForm>
```

## Gotchas

- Context-aware controls (`Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `NativeSelect`, `Select`) self-wire `aria-*`. Do not set `wireAria`.
- `RichTextarea`, `DatePicker`, `TimePicker`, and `MockImageUpload` need `wireAria` or a binding that reads `useFieldContext()`.
- Unsaved-changes confirm covers the cancel button and `beforeunload` only. The App Router cannot block sidebar or breadcrumb navigation.

# AdminWizard — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Responsive admin create/edit shell: a desktop modal with a stepper, and a mobile full page with stacked sections plus a sticky footer. Built so `/classes` and `/schedule` can share one presentation pattern.

## When to use

- Short, create-heavy admin flows that should feel like guided onboarding on desktop
- Edit flows that reuse the same steps but allow jumping between them
- Route-driven overlays (intercepting route or `surface="overlay"`) that stay deep-linkable

## When NOT to use

- Edit-heavy records that belong in tabs (`CoachFormPage`)
- List pages, queues, or any screen that is not a multi-step form
- Flows that need fields beyond the existing colocated form schema

## Examples

```tsx
<AdminForm schema={classFormSchema} defaultValues={classFormDefaultValues} onSubmit={onSubmit}>
  <AdminWizard
    title="Add Class"
    steps={classWizardSteps}
    mode="create"
    surface="overlay"
    closeHref="/classes"
    footer={<FormActions submitLabel="Save" cancelHref="/classes" />}
  >
    <AdminWizardStepPanel stepId="basics">{/* fields */}</AdminWizardStepPanel>
  </AdminWizard>
</AdminForm>
```

## Gotchas

- Keep every step's fields mounted. Inactive steps use `hidden` so React Hook Form still registers them for the final submit.
- `surface="overlay"` is a dialog at `≥768px` and a full-bleed page below that — never a nested-scroll sheet on mobile.
- Share `useUnsavedChangesGuard` between the wizard close handlers and `FormActions` so Escape and Cancel open the same confirm.
- Do not hand-edit the vendored `stepper-with-titles` source; pass `className` to drop the `min-w-[350px]` default.

# Admin form kit

Recipe for every admin write form:

1. Colocate `<form>Schema` / `<Form>Values` / `<form>DefaultValues` under `forms/<form>/`.
2. Derive every bound from `FIELD_CONSTRAINTS` — do not retype a number that already lives there.
3. Render `<AdminForm schema defaultValues onSubmit>` — screens do not call `useForm`.
4. Bind controls with `<FormField>` + a binding from `forms/bindings/`.
5. Submit through `lib/query/mutations.ts` (`useUpsertAdminClass`, …) → `getMockAdapter()`.
6. Toast through `notify.admin(id)` / `adminToastCopy`.

## Field-name and money-unit mapping

| Contracts (`FIELD_CONSTRAINTS`) | Mock / admin types (this kit) | Notes |
| --- | --- | --- |
| `defaultCustomerPrice` | `defaultPricePhp` | Keep the mock name until WIRE-001 |
| `customerPrice` | `pricePhp` | |
| `defaultRate` | `defaultRatePhp` | |
| `coachRate` | `coachRatePhp` | |
| `MONEY_UNIT = "php_decimal"` | integer pesos | `z.coerce.number().int()`. Blank optionals → `null`, not `0` |

`class.name.unique` and `session.coachId.allowInactive` are server-only. The 422 must carry `duplicate_value` / `inactive_reference` on those paths.

## Aria split

| Primitive | `useFieldContext()` | Binding |
| --- | --- | --- |
| `Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `NativeSelect`, `Select` | yes — do not spread `aria-*` | `TextBinding`, `TextareaBinding`, `BooleanBinding`, `ChoiceBinding` |
| `RichTextarea`, `DatePicker`, `TimePicker`, `MockImageUpload` | no | `RichTextBinding`, `DateBinding`, `TimeBinding`, `ImageBinding` (explicit `id` / `aria-invalid` / `aria-describedby`) |

`CheckboxGroupBinding` is composed over `Checkbox` + `FieldSet` + `FieldLegend`. There is no primitive.

## RichTextarea max length

`RICH_TEXTAREA_MAX_LENGTH` is `2000`. That conflicts with `coach.shortBio.max = 1000` and `settings.about.max = 4000`. Pass `maxLength` per field and let the form schema be authoritative.

## Unsaved-changes guard

`useUnsavedChangesGuard` covers the `FormActions` cancel control and a `beforeunload` listener. The Next App Router has no navigation-blocking API, so sidebar links and breadcrumbs are not intercepted. Pass the same guard into `FormActions` and a wizard `onRequestClose` so Escape / dialog close share the confirm. Use `hideSubmit` on intermediate wizard steps.

## Image upload seam

`ImageBinding` is an **action**, not a value binding. Mock submit `setValue`s `photoKey`. A failed upload must not leave a dangling key (BE-052).

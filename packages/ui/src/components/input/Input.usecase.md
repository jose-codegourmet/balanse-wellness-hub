# Input — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled single-line text input for forms, with a shared `sm | md | lg` size scale.

## When to use

- Standard text, email, or number fields

## When NOT to use

- Password fields → use **PasswordInput** instead
- Philippine mobile numbers → use **PhPhoneInput** instead
- Inputs with icons/buttons → use **InputGroup** instead
- OTP digits → use **InputOTP** instead
- Multi-line → use **Textarea** instead

## Examples

### Basic text input

`md` (`h-8`) is the default and matches the previous un-sized input.

```tsx
import { Input } from "@balanse/ui";

<Input type="email" placeholder="name@example.com" className="max-w-sm" />
```

### Invalid and read-only

`invalid` sets `aria-invalid` (or inherit it from `Field`). `readOnly` is muted and non-editable, distinct from `disabled` (which is faded + non-interactive).

```tsx
<Input invalid defaultValue="invalid-email" />
<Input readOnly defaultValue="Mon–Fri 7:00–20:00" />
<Input disabled defaultValue="Cannot edit" />
```

## Gotchas

- `"use client"` because it reads `useFieldContext()`. Safe outside a `Field`.
- Size scale is `sm | md | lg`. Prefer `md` in new code.
- 44px mobile touch target is opt-in: `className="max-sm:min-h-11"`.
- Value schema: `inputSchema` is `z.string()`.

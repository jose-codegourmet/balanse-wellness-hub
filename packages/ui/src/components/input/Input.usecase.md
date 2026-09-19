# Input — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled single-line text input for forms.

## When to use

- Standard text, email, password, number fields

## When NOT to use

- Inputs with icons/buttons → use **InputGroup** instead
- OTP digits → use **InputOTP** instead
- Multi-line → use **Textarea** instead

## Examples

### Basic text input

Accepts native input props like `type` and `placeholder`.

```tsx
import { Input } from "@balanse/ui";

<Input type="email" placeholder="name@example.com" className="max-w-sm" />
```

### Invalid state

Set `aria-invalid` to apply error styling.

```tsx
<Input aria-invalid defaultValue="invalid-email" placeholder="Email address" className="max-w-sm" />
```

## Gotchas

- No `"use client"` (usable from Server Components if props stay serializable).

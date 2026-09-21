# PasswordInput — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Password field with a trailing show/hide toggle. Same size scale and field wiring as Input.

## When to use

- Login, sign-up, and change-password fields
- Any secret that should stay masked until the user asks to see it

## When NOT to use

- Plain text, email, or number → use **Input** instead
- Inputs with other addons → use **InputGroup** instead

## Examples

```tsx
import { PasswordInput } from "@balanse/ui";

<PasswordInput id="login-password" autoComplete="current-password" />
```

## Gotchas

- `"use client"` because the toggle owns visibility state.
- `className` lands on the wrapper so width constraints stay aligned with the button.
- The toggle is `type="button"` so it never submits the surrounding form.
- Value schema: `passwordInputSchema` is `z.string()`.

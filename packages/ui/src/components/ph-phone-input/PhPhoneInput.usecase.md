# PhPhoneInput — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Masked Philippine mobile input. Accepts `09…`, `9…`, and `+63 9…`, and displays `09XX XXX XXXX`.

## When to use

- Customer contact number
- Studio / GCash mobile numbers

## When NOT to use

- Email, name, or other text → use **Input**
- Non-PH numbers — this control rejects them

## Examples

```tsx
import { PhPhoneInput } from "@balanse/ui";

<PhPhoneInput value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} />
```

## Gotchas

- `"use client"` because it owns type-in masking state.
- The stored value is the masked display string (`0917 123 4567`). `isPhMobile` accepts that form.
- Landlines are out of scope. Only PH mobile (`09XXXXXXXXX` / `+639XXXXXXXXX`).

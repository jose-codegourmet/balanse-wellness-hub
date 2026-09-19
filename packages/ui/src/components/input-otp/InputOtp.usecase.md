# InputOTP — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

One-time-password / PIN digit entry with per-slot display and caret (`input-otp`).

## When to use

- 2FA / verification codes
- PIN entry with optional separators (e.g. 3+3)

## When NOT to use

- Free-text passwords or emails → use **Input** instead

## Examples

### Six-digit verification code

Each `InputOTPSlot` needs a matching `index` under `maxLength`.

```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@balanse/ui";

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

### Split groups with a separator

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@balanse/ui";

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

## Gotchas

- `"use client"` required; export names are `InputOTP*` (capital OTP) even though the file is `InputOtp.tsx`.
- Slot must be under InputOTP with matching `index`/`maxLength`.

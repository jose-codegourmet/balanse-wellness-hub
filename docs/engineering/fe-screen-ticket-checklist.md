# FE screen ticket checklist

Use this on every `FE-PUB`, `FE-CUS`, `FE-ADM`, and `FE-SHR` ticket.

- [ ] Empty, loading (localized skeleton — no full-page spinner), and error states
- [ ] Review at 360 / 768 / 1280 (`@balanse/config` breakpoints)
- [ ] Keyboard + Storybook a11y (violations fail the Storybook build)
- [ ] No raw enum names in the UI — use `@balanse/domain` labels
- [ ] No invented fields, tabs, or actions beyond the screen spec
- [ ] Data only via `getMockAdapter()` — never import fixture files
- [ ] Money/dates via `@balanse/domain` formatters — no inline `toLocaleString`
- [ ] No hardcoded hex in screen code — tokens only
- [ ] Public/customer views never receive coach rate fields
- [ ] Placeholders for marketing images; do not invent production assets
- [ ] Component ships schema + defaultValues + story + usecase (docs/component-guide.md)
- [ ] Forms bind through react-hook-form + zod (zodResolver); errors via FieldError

Linked from the FE epic and foundation tickets as the shared quality bar (FE-FND-011).

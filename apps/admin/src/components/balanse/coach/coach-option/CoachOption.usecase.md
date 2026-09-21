# CoachOption — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

Recognizable coach row for admin pickers: reserved 1:1 avatar (`CoachPhoto`), name, truncated specialties, and an Inactive badge when the coach is still selectable.

## When to use

- Session / class coach fields (`ComboboxBinding`, `CheckboxGroupBinding`)
- Reports coach filter
- Selected-session side panel

Pass `toCoachChoiceOption(coach)` into `leading` / `description` / `label`. Do not import fixtures from screens — map `adminCoachesQuery` rows.

## When NOT to use

- Public / customer coach cards (`apps/web`)
- Admin coach **rates** — this presenter is a `PublicCoach`-shaped object only

## Examples

```tsx
<ComboboxBinding
  {...field}
  options={coaches.map(toCoachChoiceOption)}
  placeholder="Search coach…"
/>
```

```tsx
<CoachOption coach={coach} layout="row" />
```

## Gotchas

- Avatars are `aria-hidden`. The accessible name stays `coach.name` (option label).
- Use the 1:1 crop only. The avatar box is `size-7` so the list does not reflow while images load.
- Placeholder coaches (Alec / Sofia / Kate, `photoKey: null`) render the ASSET-014 crest, not an empty box.
- Do not pass `defaultRatePhp` / `rateType` into this component.

# Accordion — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Collapsible FAQ/section panels with animated open/close and chevron indicators.

## When to use

- FAQ or help content with many optional sections
- Settings groups where only some details should expand
- Multi-open lists via `multiple`

## When NOT to use

- Peer content switching that should stay visible → use **Tabs** instead
- Single expand panel → use **Collapsible** instead
- One-shot confirmations → use **AlertDialog** instead

## Examples

### FAQ list with one panel open

Each `AccordionItem` needs a `value`; `defaultValue` takes an array.

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@balanse/ui";

<Accordion defaultValue={["item-1"]} className="max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It follows WAI-ARIA design patterns for accordions and keyboard navigation.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that match the rest of the design system.
    </AccordionContent>
  </AccordionItem>
</Accordion>;
```

### Multiple panels open at once

Add `multiple` when several sections should stay expanded together.

```tsx
<Accordion multiple defaultValue={["item-1", "item-2"]} className="max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It follows WAI-ARIA design patterns.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it animated?</AccordionTrigger>
    <AccordionContent>Yes. Panels animate with smooth height transitions.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Gotchas

- Compose Accordion → Item → Trigger + Content
- Panel height animation uses `--accordion-panel-height` and `data-open` / `data-closed`

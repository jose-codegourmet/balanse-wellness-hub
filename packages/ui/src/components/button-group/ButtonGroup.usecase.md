# ButtonGroup — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Visually joined cluster of buttons/inputs sharing borders and radius.

## When to use

- Segmented actions (Left / Center / Right)
- Toolbar icon clusters
- Prefixed label + controls via `ButtonGroupText`

## When NOT to use

- Single standalone CTA → use **Button** instead
- Unrelated spaced actions → use separate **Button**s instead

## Examples

### Segmented actions

Children keep their own `variant`; the group joins their borders.

```tsx
import { Button } from "@balanse/ui";
import { ButtonGroup } from "@balanse/ui";

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>;
```

### Labeled icon toolbar

`ButtonGroupText` prefixes the cluster; `ButtonGroupSeparator` splits it.

```tsx
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { ButtonGroupText } from "@balanse/ui";

<ButtonGroup>
  <ButtonGroupText>Format</ButtonGroupText>
  <Button variant="outline" size="icon">
    <BoldIcon />
  </Button>
  <Button variant="outline" size="icon">
    <ItalicIcon />
  </Button>
  <Button variant="outline" size="icon">
    <UnderlineIcon />
  </Button>
</ButtonGroup>;
```

## Gotchas

- Joined borders assume children expose `data-slot` (works well with **Button**)

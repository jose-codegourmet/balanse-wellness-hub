# EmblaCarousel — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Accessible Embla-based carousel with prev/next, dots, and horizontal/vertical/auto-width variants.

## When to use

- Image/product galleries with keyboard arrows and dots
- Auto-width chip/tag carousels (`horizontal-auto`)

## When NOT to use

- Static grids that don't need swipe/snap → use CSS instead
- Tabbed content → use **Tabs** instead

## Examples

### Horizontal gallery with dots

Nest slides in `EmblaCarouselContent` and add controls as siblings.

```tsx
import {
  EmblaCarousel,
  EmblaCarouselContent,
  EmblaCarouselDots,
  EmblaCarouselNext,
  EmblaCarouselPrev,
  EmblaCarouselSlide,
} from "@balanse/ui";
import { Card, CardContent } from "@balanse/ui";

<div className="mx-12 mb-10 w-full max-w-sm">
  <EmblaCarousel variant="horizontal">
    <EmblaCarouselContent>
      {slides.map((slide) => (
        <EmblaCarouselSlide key={slide.title}>
          <Card>
            <CardContent className="flex aspect-video items-center justify-center p-6">
              <p className="font-medium">{slide.title}</p>
            </CardContent>
          </Card>
        </EmblaCarouselSlide>
      ))}
    </EmblaCarouselContent>
    <EmblaCarouselPrev />
    <EmblaCarouselNext />
    <EmblaCarouselDots />
  </EmblaCarousel>
</div>
```

## Gotchas

- `"use client"` required; children must be inside EmblaCarousel.
- Prev/Next sit absolutely outside — parent needs padding; Dots hidden when ≤1 snap.

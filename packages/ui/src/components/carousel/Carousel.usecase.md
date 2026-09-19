# Carousel — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Embla-powered slideshow with prev/next controls and keyboard arrows.

## When to use

- Image or card slideshows
- Horizontal product/feature rotators

## When NOT to use

- Simple horizontal file chips → use **AttachmentGroup** instead
- Tabbed peer panels → use **Tabs** instead
- Need dots / auto-width variants → prefer **EmblaCarousel**

## Examples

### Basic horizontal carousel

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@balanse/ui";
import { Card, CardContent } from "@balanse/ui";

<div className="mx-12 w-full max-w-sm">
  <Carousel>
    <CarouselContent>
      {slides.map((slide) => (
        <CarouselItem key={slide.title}>
          <Card>
            <CardContent className="flex aspect-video items-center justify-center p-6">
              <p className="font-medium">{slide.title}</p>
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</div>
```

### Vertical

```tsx
<Carousel orientation="vertical" className="h-[280px]">
  <CarouselContent className="-mt-4 h-[280px]">
    {/* CarouselItem children */}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

## Gotchas

- `"use client"`; nest Content/Item under Carousel; Prev/Next sit outside (`-left-12`/`-right-12`) — reserve margin.

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardContent } from "../card/Card";

import {
  EmblaCarousel,
  EmblaCarouselContent,
  EmblaCarouselDots,
  EmblaCarouselNext,
  EmblaCarouselPrev,
  EmblaCarouselSlide,
} from "./EmblaCarousel";

const meta: Meta<typeof EmblaCarousel> = {
  title: "Components/EmblaCarousel",
  component: EmblaCarousel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof EmblaCarousel>;

const slides = [
  { title: "Slide 1", description: "First slide content" },
  { title: "Slide 2", description: "Second slide content" },
  { title: "Slide 3", description: "Third slide content" },
  { title: "Slide 4", description: "Fourth slide content" },
  { title: "Slide 5", description: "Fifth slide content" },
];

const autoWidthLabels = [
  "All",
  "Dogs",
  "Cats",
  "Puppies",
  "Morning sessions",
  "Playdates",
  "Walking buddies",
  "Training tips",
];

export const Horizontal: Story = {
  render: (args) => (
    <div className="mx-12 mb-10 w-full max-w-sm">
      <EmblaCarousel {...args} variant="horizontal">
        <EmblaCarouselContent>
          {slides.map((slide) => (
            <EmblaCarouselSlide key={slide.title}>
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <div className="text-center">
                    <p className="font-medium">{slide.title}</p>
                    <p className="text-sm text-muted-foreground">{slide.description}</p>
                  </div>
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
  ),
};

export const HorizontalAutoWidth: Story = {
  render: (args) => (
    <div className="mx-12 w-full max-w-md">
      <EmblaCarousel {...args} variant="horizontal-auto">
        <EmblaCarouselContent className="-ml-2">
          {autoWidthLabels.map((label) => (
            <EmblaCarouselSlide key={label} className="pl-2">
              <div className="rounded-full border bg-muted px-4 py-2 text-sm font-medium whitespace-nowrap">
                {label}
              </div>
            </EmblaCarouselSlide>
          ))}
        </EmblaCarouselContent>
        <EmblaCarouselPrev />
        <EmblaCarouselNext />
      </EmblaCarousel>
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-xs pt-12 pb-12">
      <EmblaCarousel {...args} variant="vertical" className="h-[280px]">
        <EmblaCarouselContent className="-mt-4 h-[280px]">
          {slides.map((slide) => (
            <EmblaCarouselSlide key={slide.title}>
              <Card>
                <CardContent className="flex h-24 items-center justify-center p-6">
                  <span className="font-medium">{slide.title}</span>
                </CardContent>
              </Card>
            </EmblaCarouselSlide>
          ))}
        </EmblaCarouselContent>
        <EmblaCarouselPrev />
        <EmblaCarouselNext />
      </EmblaCarousel>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardContent } from "../card/Card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const slides = [
  { title: "Slide 1", description: "First slide content" },
  { title: "Slide 2", description: "Second slide content" },
  { title: "Slide 3", description: "Third slide content" },
];

export const Default: Story = {
  render: (args) => (
    <div className="mx-12 w-full max-w-sm">
      <Carousel {...args}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <div className="text-center">
                    <p className="font-medium">{slide.title}</p>
                    <p className="text-sm text-muted-foreground">{slide.description}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-xs pt-12 pb-12">
      <Carousel {...args} orientation="vertical" className="h-[280px]">
        <CarouselContent className="-mt-4 h-[280px]">
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <Card>
                <CardContent className="flex h-24 items-center justify-center p-6">
                  <span className="font-medium">{slide.title}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const MultipleVisible: Story = {
  render: (args) => (
    <div className="mx-12 w-full max-w-lg">
      <Carousel {...args} opts={{ align: "start" }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title} className="basis-1/2">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-medium">{slide.title}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const WithoutControls: Story = {
  render: (args) => (
    <div className="w-full max-w-sm">
      <Carousel {...args}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <span className="font-medium">{slide.title}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};

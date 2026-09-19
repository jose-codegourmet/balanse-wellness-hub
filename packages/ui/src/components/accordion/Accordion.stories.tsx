import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const accordionItems = [
  {
    value: "item-1",
    title: "Is it accessible?",
    content: "Yes. It follows WAI-ARIA design patterns for accordions and keyboard navigation.",
  },
  {
    value: "item-2",
    title: "Is it styled?",
    content: "Yes. It comes with default styles that match the rest of the design system.",
  },
  {
    value: "item-3",
    title: "Is it animated?",
    content: "Yes. Panels animate open and closed with smooth height transitions.",
  },
];

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} defaultValue={["item-1"]} className="max-w-md">
      {accordionItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const SingleOpen: Story = {
  render: (args) => (
    <Accordion {...args} defaultValue={["item-1"]} className="max-w-md">
      {accordionItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: (args) => (
    <Accordion {...args} multiple defaultValue={["item-1", "item-2"]} className="max-w-md">
      {accordionItems.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function TokensDoc() {
  return (
    <div>
      <h1>Balansé tokens</h1>
      <p>Cream, warm white, beige/tan, muted brown, navy/charcoal, gold accents.</p>
      <p>Breakpoints: 360 mobile day · 768 tablet week · 1280 desktop month.</p>
    </div>
  );
}

const meta = {
  title: "Foundation/Tokens",
  component: TokensDoc,
} satisfies Meta<typeof TokensDoc>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {};

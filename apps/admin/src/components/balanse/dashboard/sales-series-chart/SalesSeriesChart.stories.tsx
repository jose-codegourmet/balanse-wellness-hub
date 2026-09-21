import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SalesSeriesChart } from "./SalesSeriesChart";
import { salesSeriesChartDefaultValues } from "./SalesSeriesChart.stories-data";

const meta: Meta<typeof SalesSeriesChart> = {
  title: "Admin/Components/SalesSeriesChart",
  component: SalesSeriesChart,
  tags: ["autodocs"],
  args: { ...salesSeriesChartDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllZero: Story = {
  args: {
    series: {
      ...salesSeriesChartDefaultValues.series,
      points: salesSeriesChartDefaultValues.series.points.map((point) => ({
        ...point,
        value: 0,
      })),
    },
  },
};

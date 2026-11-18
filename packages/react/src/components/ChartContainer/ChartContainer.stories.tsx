import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartContainer } from "./ChartContainer";
import { Button } from "../Button/Button";

const meta: Meta<typeof ChartContainer> = {
  title: "Family D — Data & Content/ChartContainer",
  component: ChartContainer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

// A plain inline SVG stands in for a real charting library's output —
// ChartContainer only owns the chrome around whatever chart a consumer
// renders into `children`.
const SampleBars = (
  <svg viewBox="0 0 280 120" width="100%" height="120" role="img" aria-label="Revenue and costs by quarter">
    <rect x="10" y="40" width="24" height="80" fill="#60a5fa" />
    <rect x="44" y="20" width="24" height="100" fill="#34d399" />
    <rect x="90" y="60" width="24" height="60" fill="#60a5fa" />
    <rect x="124" y="30" width="24" height="90" fill="#34d399" />
    <rect x="170" y="10" width="24" height="110" fill="#60a5fa" />
    <rect x="204" y="50" width="24" height="70" fill="#34d399" />
  </svg>
);

export const Default: Story = {
  args: {
    title: "Revenue vs. costs",
    description: "Last 6 quarters",
    legend: [
      { label: "Revenue", color: "#60a5fa" },
      { label: "Costs", color: "#34d399" },
    ],
    children: SampleBars,
  },
};

export const WithActions: Story = {
  args: {
    title: "Revenue vs. costs",
    legend: [
      { label: "Revenue", color: "#60a5fa" },
      { label: "Costs", color: "#34d399" },
    ],
    actions: <Button size="sm">Export</Button>,
    children: SampleBars,
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "./Accordion";

const items = [
  {
    value: "general",
    title: "What is B4?",
    content: "A standalone, commercially distributable React component library and design system.",
  },
  {
    value: "themes",
    title: "What themes does it support?",
    content: "Two first-class themes: B4 Graphite (dark) and B4 Porcelain (light).",
  },
  {
    value: "a11y",
    title: "Is it accessible?",
    content: "Every component is built on Base UI and passes axe-core checks in both themes.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Family C — Navigation & Overlays/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: { items },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {};
export const DefaultOpen: Story = { args: { defaultValue: "themes" } };

export const MultipleOpen: Story = {
  args: { multiple: true, defaultValue: ["general", "a11y"] },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      ...items,
      { value: "beta", title: "Beta features (coming soon)", content: "", disabled: true },
    ],
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Family C — Navigation & Overlays/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  args: {
    "aria-label": "Checkout progress",
    steps: [
      { label: "Cart", description: "Review items" },
      { label: "Shipping", description: "Add address" },
      { label: "Payment", description: "Confirm payment" },
      { label: "Done" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Horizontal: Story = {
  args: { activeStep: 1, orientation: "horizontal" },
};

export const Vertical: Story = {
  args: { activeStep: 1, orientation: "vertical" },
};

export const AllComplete: Story = {
  args: { activeStep: 4 },
};

export const NotStarted: Story = {
  args: { activeStep: 0 },
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default = Horizontal;

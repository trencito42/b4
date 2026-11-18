import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorState } from "./ErrorState";
import { Button } from "../Button/Button";

const meta: Meta<typeof ErrorState> = {
  title: "Family D — Data & Content/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    title: "Something went wrong",
    description: "We couldn't load this page. Please try again.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Something went wrong",
    description: "We couldn't load this page. Please try again.",
    action: <Button>Try again</Button>,
  },
};

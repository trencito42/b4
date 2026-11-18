import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Family C — Navigation & Overlays/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: { "aria-label": "Pagination" },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} totalPages={5} onPageChange={setPage} />;
  },
};

export const ManyPages: Story = {
  name: "Many pages (ellipsis)",
  render: (args) => {
    const [page, setPage] = useState(12);
    return <Pagination {...args} page={page} totalPages={40} onPageChange={setPage} />;
  },
};

export const FirstPage: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} totalPages={8} onPageChange={setPage} />;
  },
};

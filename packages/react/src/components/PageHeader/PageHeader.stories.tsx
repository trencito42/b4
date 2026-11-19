import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "./PageHeader";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";
import { Button } from "../Button/Button";

const meta: Meta<typeof PageHeader> = {
  title: "Family F — Application Patterns/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Projects",
    description: "Everything your team is currently working on.",
  },
};

export const WithBreadcrumbsAndActions: Story = {
  args: {
    title: "Marketing site",
    description: "Project overview and settings.",
    breadcrumbs: (
      <Breadcrumbs aria-label="Breadcrumb" items={[{ label: "Projects", href: "#" }, { label: "Marketing site" }]} />
    ),
    actions: (
      <>
        <Button variant="secondary">Export</Button>
        <Button>New deployment</Button>
      </>
    ),
  },
};

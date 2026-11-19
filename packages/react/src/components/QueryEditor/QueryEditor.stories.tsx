import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryEditor } from "./QueryEditor";

const sample = `select id, status
from deployments
where region = 'eu' -- active region
order by created_at desc
limit 20`;

/**
 * Do use QueryEditor when someone is writing a query that should be
 * tokenized and checked (unclosed strings, comments, parentheses).
 * Don't use it as a general-purpose code editor, and don't substitute
 * Textarea — Textarea has no syntax model.
 */
const meta: Meta<typeof QueryEditor> = {
  title: "Family F — Application Patterns/QueryEditor",
  component: QueryEditor,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QueryEditor>;

export const Default: Story = {
  args: {
    "aria-label": "Query",
    defaultValue: sample,
  },
};

export const WithError: Story = {
  args: {
    "aria-label": "Query",
    defaultValue: "select * from hosts where name = 'edge",
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Query",
    defaultValue: "select 1",
    disabled: true,
  },
};

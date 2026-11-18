import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./CodeBlock";

const meta: Meta<typeof CodeBlock> = {
  title: "Family D — Data & Content/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

const sample = `function greet(name) {
  return \`Hello, \${name}!\`;
}`;

export const Default: Story = {
  args: {
    code: sample,
    language: "javascript",
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: sample,
    language: "javascript",
    showLineNumbers: true,
  },
};

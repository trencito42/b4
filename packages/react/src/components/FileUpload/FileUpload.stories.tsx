import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "./FileUpload";

const meta: Meta<typeof FileUpload> = {
  title: "Family B — Forms & Inputs/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  args: { label: "Attachments" },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);
    return <FileUpload {...args} value={files} onValueChange={setFiles} />;
  },
};

export const SingleFileImagesOnly: Story = {
  name: "Single file, images only",
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <FileUpload
        {...args}
        multiple={false}
        accept="image/*"
        hint="PNG or JPG only"
        value={files}
        onValueChange={setFiles}
      />
    );
  },
};

export const WithSizeAndCountLimits: Story = {
  name: "With size and count limits",
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <FileUpload
        {...args}
        maxSizeBytes={1024 * 1024}
        maxFiles={3}
        hint="Up to 3 files, 1 MB each"
        value={files}
        onValueChange={setFiles}
      />
    );
  },
};

export const WithError: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);
    return <FileUpload {...args} value={files} onValueChange={setFiles} error="At least one file is required" required />;
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

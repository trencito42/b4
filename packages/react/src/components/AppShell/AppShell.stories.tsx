import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell, AppShellMobileTrigger } from "./AppShell";

const meta: Meta<typeof AppShell> = {
  title: "Family F — Application Patterns/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

const placeholderStyle = { padding: 16, color: "var(--b4-text-secondary)" };

export const Default: Story = {
  render: () => (
    <AppShell
      header={<div style={{ padding: "12px 16px", fontWeight: 600 }}>B4 Studio</div>}
      sidebar={
        <div style={placeholderStyle}>
          <p>Projects</p>
          <p>Settings</p>
        </div>
      }
    >
      <div style={placeholderStyle}>
        <p>Main content area.</p>
      </div>
    </AppShell>
  ),
};

export const AdaptiveMobile: Story = {
  render: () => (
    <AppShell
      header={
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
          <AppShellMobileTrigger />
          <span style={{ fontWeight: 600 }}>B4 Studio</span>
        </div>
      }
      sidebar={
        <div style={placeholderStyle}>
          <p>Projects</p>
          <p>Settings</p>
        </div>
      }
    >
      <div style={placeholderStyle}>
        <p>Main content area.</p>
      </div>
    </AppShell>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <AppShell header={<div style={{ padding: "12px 16px", fontWeight: 600 }}>B4 Studio</div>}>
      <div style={placeholderStyle}>
        <p>No sidebar — just a header and main content.</p>
      </div>
    </AppShell>
  ),
};

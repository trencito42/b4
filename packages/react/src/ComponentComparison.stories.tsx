import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  Checkbox,
  InlineAlert,
  Progress,
  Select,
  Switch,
  Tabs,
  TextField,
} from "./index";

function ComponentComparison() {
  const [saved, setSaved] = useState(false);
  return (
    <main
      aria-label="Cross-family comparison"
      style={{
        display: "grid",
        gap: "var(--b4-space-8)",
        maxWidth: "42rem",
        marginInline: "auto",
      }}
    >
      <Tabs
        aria-label="Workspace areas"
        items={[
          {
            value: "workspace",
            label: "Workspace",
            content: (
              <Card
                variant="raised"
                style={{ display: "grid", gap: "var(--b4-space-6)" }}
              >
                <TextField label="Workspace name" defaultValue="Design systems" />
                <Select
                  label="Visibility"
                  defaultValue="team"
                  items={[
                    { value: "team", label: "Team" },
                    { value: "private", label: "Private" },
                  ]}
                />
                <Checkbox label="Include shared templates" defaultChecked />
                <Switch label="Send weekly updates" />
                <Progress label="Storage used" value={65} />
                <Button onClick={() => setSaved(true)}>Save workspace</Button>
                {saved && (
                  <InlineAlert tone="success" title="Workspace saved">
                    Your settings are up to date.
                  </InlineAlert>
                )}
              </Card>
            ),
          },
          {
            value: "activity",
            label: "Activity",
            content: <Card>No recent activity.</Card>,
          },
        ]}
        defaultValue="workspace"
      />
    </main>
  );
}

const meta = {
  title: "Review/Component Comparison",
  component: ComponentComparison,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ComponentComparison>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

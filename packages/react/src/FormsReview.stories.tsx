import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field as BaseField } from "@base-ui/react/field";
import {
  Checkbox,
  ColorPicker,
  Combobox,
  DatePicker,
  Field,
  FileUpload,
  MultiSelect,
  NumberField,
  PasswordField,
  RadioGroup,
  SearchField,
  Select,
  Slider,
  Switch,
  Textarea,
  TextField,
  TimePicker,
} from "./index";

const options = Array.from({ length: 24 }, (_, index) => ({
  value: String(index),
  label: index === 0 ? "Studio" : `Workspace ${index}`,
  description: index === 0 ? "Access to shared projects" : undefined,
  disabled: index === 1,
}));

function FormsReview() {
  const [checked, setChecked] = useState(false);
  const [mixed, setMixed] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [plan, setPlan] = useState("personal");
  const [color, setColor] = useState("#3366cc");

  return (
    <main
      className="forms-review"
      aria-label="Forms review"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22ch), 1fr))",
        gap: "var(--b4-space-10)",
        alignItems: "start",
      }}
    >
      <Field label="Contact" hint="Used for account updates.">
        <BaseField.Control
          className="b4-text-field__control"
          style={{ color: "var(--b4-text-primary)", font: "inherit" }}
          placeholder="Contact name"
        />
      </Field>
      <TextField
        label="Email"
        required
        error="Enter a valid email address."
        defaultValue="hello@"
      />
      <PasswordField label="Password" defaultValue="test-passphrase" />
      <SearchField label="Search" defaultValue="Projects" />
      <NumberField label="Quantity" defaultValue={1} min={0} max={3} step={0.25} />
      <Textarea
        label="Description"
        rows={3}
        defaultValue="Shared design resources and project files."
      />
      <Checkbox
        label="Include archived"
        checked={checked}
        indeterminate={mixed}
        onCheckedChange={(next) => {
          setMixed(false);
          setChecked(next);
        }}
      />
      <Switch
        label="Notifications"
        checked={notifications}
        onCheckedChange={setNotifications}
      />
      <RadioGroup
        aria-label="Plan"
        value={plan}
        onValueChange={setPlan}
        items={[
          { value: "personal", label: "Personal", description: "One workspace" },
          { value: "team", label: "Team", description: "Shared workspaces" },
          { value: "legacy", label: "Legacy", disabled: true },
        ]}
      />
      <Select label="Workspace" items={options} defaultValue="0" />
      <Combobox label="Find workspace" items={options} />
      <MultiSelect label="Workspaces" items={options} defaultValue={["0", "2"]} />
      <Slider label="Volume" defaultValue={65} format={(value) => `${value}%`} />
      <Slider
        label="Price range"
        defaultValue={[25, 75]}
        thumbLabels={["Minimum price", "Maximum price"]}
      />
      <DatePicker label="Delivery date" defaultValue={new Date(2026, 10, 19)} />
      <TimePicker label="Delivery time" defaultValue={{ hours: 16, minutes: 30 }} />
      <ColorPicker label="Accent color" value={color} onValueChange={setColor} />
      <FileUpload
        label="Attachments"
        hint="PNG images only."
        accept="image/png"
        multiple={false}
      />
    </main>
  );
}

const meta = {
  title: "Family B — Forms & Inputs/Forms Review",
  component: FormsReview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FormsReview>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

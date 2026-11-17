import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field as BaseField } from "@base-ui/react/field";
import { Field } from "./Field";

const meta: Meta<typeof Field> = {
  title: "Family B — Forms & Inputs/Field",
  component: Field,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Field>;

const selectStyle = {
  height: "var(--b4-control-height)",
  padding: "0 var(--b4-control-padding-x)",
  borderRadius: "var(--b4-radius-md)",
  border: "1.5px solid var(--b4-border-default)",
  background: "var(--b4-surface-1)",
  color: "var(--b4-text-primary)",
  fontFamily: "var(--b4-font-sans)",
  fontSize: "var(--b4-text-base)",
} as const;

/**
 * `Field` is the shared label/hint/error wrapper — `TextField`, `Textarea`,
 * `PasswordField`, and `SearchField` all use it. Use it directly only
 * when composing a custom control that none of those cover, and route
 * that control through Base UI's `Field.Control` (`render` prop) so the
 * label/id association actually wires up — see this story's source and
 * `Field.tsx`'s doc comment.
 */
export const WithCustomControl: Story = {
  args: {
    label: "Favorite color",
    hint: "Pick the one you'll use most.",
  },
  render: (args) => (
    <Field {...args}>
      <BaseField.Control
        render={
          <select style={selectStyle}>
            <option>Graphite</option>
            <option>Porcelain</option>
          </select>
        }
      />
    </Field>
  ),
};

export const WithError: Story = {
  args: { label: "Favorite color", error: "Pick one." },
  render: (args) => (
    <Field {...args}>
      <BaseField.Control
        render={
          <select style={selectStyle}>
            <option>Graphite</option>
            <option>Porcelain</option>
          </select>
        }
      />
    </Field>
  ),
};

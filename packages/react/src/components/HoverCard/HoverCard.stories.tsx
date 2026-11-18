import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard } from "./HoverCard";
import { Link } from "../Link/Link";
import { Avatar } from "../Avatar/Avatar";

const meta: Meta<typeof HoverCard> = {
  title: "Family C — Navigation & Overlays/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const UserPreview: Story = {
  render: () => (
    <HoverCard trigger={<Link href="#">@ada</Link>}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar name="Ada Lovelace" />
        <div>
          <strong style={{ display: "block" }}>Ada Lovelace</strong>
          <span style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)" }}>
            First computer programmer.
          </span>
        </div>
      </div>
    </HoverCard>
  ),
};

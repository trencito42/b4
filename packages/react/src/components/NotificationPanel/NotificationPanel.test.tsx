import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NotificationPanel, type NotificationItem } from "./NotificationPanel";
import { IconButton } from "../IconButton/IconButton";

const BellIcon = <svg viewBox="0 0 16 16" aria-hidden="true" />;

const items: NotificationItem[] = [
  { id: "1", title: "New comment", description: "Ada left a comment.", read: false },
  { id: "2", title: "Deploy succeeded", read: true },
];

// `Popover`'s `trigger` prop clones the element it's given with the
// handlers/ref Base UI's own Trigger needs — passing a *component* that
// wraps IconButton (instead of the IconButton element itself) breaks that,
// since cloneElement adds props to the wrapper, which never forwards them
// down. Always pass the real element, not a component around it.
const trigger = <IconButton icon={BellIcon} aria-label="Notifications" variant="ghost" />;

describe("NotificationPanel", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationPanel items={items} trigger={trigger} />);

    expect(screen.queryByText("New comment")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByText("New comment")).toBeInTheDocument();
    expect(screen.getByText("Deploy succeeded")).toBeInTheDocument();
  });

  it("shows the empty message when there are no notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationPanel items={[]} trigger={trigger} />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });

  it("calls onItemClick with the clicked item's id", async () => {
    const onItemClick = vi.fn();
    const user = userEvent.setup();
    render(<NotificationPanel items={items} trigger={trigger} onItemClick={onItemClick} />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await user.click(await screen.findByText("New comment"));

    expect(onItemClick).toHaveBeenCalledWith("1");
  });

  it("shows a 'Mark all as read' action only when there are unread items and a handler", async () => {
    const onMarkAllRead = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <NotificationPanel items={items} trigger={trigger} onMarkAllRead={onMarkAllRead} />,
    );

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await user.click(await screen.findByRole("button", { name: "Mark all as read" }));
    expect(onMarkAllRead).toHaveBeenCalledOnce();

    rerender(
      <NotificationPanel
        items={items.map((item) => ({ ...item, read: true }))}
        trigger={trigger}
        onMarkAllRead={onMarkAllRead}
      />,
    );
    expect(screen.queryByRole("button", { name: "Mark all as read" })).not.toBeInTheDocument();
  });

  it("marks unread items with visually-hidden '(unread)' text, not color alone", async () => {
    const user = userEvent.setup();
    render(<NotificationPanel items={items} trigger={trigger} />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByText("(unread)")).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(<NotificationPanel items={items} trigger={trigger} onMarkAllRead={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await screen.findByText("New comment");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

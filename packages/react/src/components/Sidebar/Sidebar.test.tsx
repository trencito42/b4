import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Sidebar, type SidebarSection } from "./Sidebar";

const sections: SidebarSection[] = [
  {
    id: "main",
    items: [
      { id: "home", label: "Home", href: "#home" },
      { id: "projects", label: "Projects", href: "#projects" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [{ id: "settings", label: "Settings", onClick: vi.fn() }],
  },
];

describe("Sidebar", () => {
  it("renders each item as a real link or button, grouped by section", () => {
    render(<Sidebar sections={sections} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders a section label when provided, and omits it otherwise", () => {
    render(<Sidebar sections={sections} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.queryByText("main")).toBeNull();
  });

  it("marks the active item with aria-current", () => {
    render(<Sidebar sections={sections} activeItemId="projects" />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("calls an item's onClick handler", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Sidebar
        sections={[{ id: "s", items: [{ id: "a", label: "Action", onClick }] }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Action" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Sidebar sections={sections} activeItemId="home" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

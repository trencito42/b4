import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NavigationMenu } from "./NavigationMenu";

const sections = [
  {
    label: "Products",
    items: [
      { label: "Overview", href: "/products" },
      { label: "Tokens", href: "/products/tokens", description: "Shared design values" },
    ],
  },
  {
    label: "Resources",
    items: [{ label: "Documentation", href: "/docs" }],
  },
];

describe("NavigationMenu", () => {
  it("renders a trigger for each section, closed by default", () => {
    render(<NavigationMenu aria-label="Main" sections={sections} />);
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resources" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Overview" })).not.toBeInTheDocument();
  });

  it("reveals a section's links when its trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<NavigationMenu aria-label="Main" sections={sections} />);

    await user.click(screen.getByRole("button", { name: "Products" }));
    expect(await screen.findByRole("link", { name: /Overview/ })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /Tokens/ })).toHaveAttribute("href", "/products/tokens");
  });

  // Switching sections once the menu is open happens via hover, not a
  // second click (Base UI's Trigger opens "when hovered or clicked"; a
  // click on a trigger that's already the open one toggles it closed
  // instead). `userEvent.click` can't express "move the pointer across
  // sibling triggers" the way a real mouse does, so this is covered with
  // real pointer movement in e2e/navigation-menu.spec.ts instead.

  it("has no axe violations while a section is open", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavigationMenu aria-label="Main" sections={sections} />);
    await user.click(screen.getByRole("button", { name: "Products" }));
    await screen.findByRole("link", { name: /Overview/ });

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

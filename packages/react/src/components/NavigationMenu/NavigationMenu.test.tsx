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

const richSections = [
  {
    label: "Platform",
    columns: 2 as const,
    items: [
      {
        label: "Tokens",
        href: "/tokens",
        description: "Color and spacing tokens",
        badge: "New",
        icon: <span data-testid="token-icon">🎨</span>,
      },
      {
        label: "Motion",
        href: "/motion",
        description: "Spring physics presets",
      },
    ],
    footer: {
      label: "All Guides",
      href: "/guides",
    },
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

  it("renders badges, icons, and footer links in rich mega-menus", async () => {
    const user = userEvent.setup();
    render(<NavigationMenu aria-label="Main" sections={richSections} />);

    await user.click(screen.getByRole("button", { name: "Platform" }));
    expect(await screen.findByRole("link", { name: /Tokens/ })).toBeInTheDocument();
    expect(screen.getByTestId("token-icon")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /All Guides/ })).toHaveAttribute("href", "/guides");
  });

  it("has no axe violations while a section is open", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavigationMenu aria-label="Main" sections={richSections} />);
    await user.click(screen.getByRole("button", { name: "Platform" }));
    await screen.findByRole("link", { name: /Tokens/ });

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

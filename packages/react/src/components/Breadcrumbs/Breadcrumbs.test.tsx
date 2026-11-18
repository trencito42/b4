import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Breadcrumbs } from "./Breadcrumbs";

const items = [
  { label: "Projects", href: "/projects" },
  { label: "B4", href: "/projects/b4" },
  { label: "Components" },
];

describe("Breadcrumbs", () => {
  it("renders as a nav with an ordered list", () => {
    render(<Breadcrumbs aria-label="Breadcrumb" items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders earlier items as real links", () => {
    render(<Breadcrumbs aria-label="Breadcrumb" items={items} />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "B4" })).toHaveAttribute("href", "/projects/b4");
  });

  it("marks the last item as the current page, not a link", () => {
    render(<Breadcrumbs aria-label="Breadcrumb" items={items} />);
    expect(screen.queryByRole("link", { name: "Components" })).not.toBeInTheDocument();
    expect(screen.getByText("Components")).toHaveAttribute("aria-current", "page");
  });

  it("renders a non-navigable ancestor without an href as plain text", () => {
    render(
      <Breadcrumbs
        aria-label="Breadcrumb"
        items={[{ label: "…" }, { label: "B4", href: "/b4" }, { label: "Button" }]}
      />,
    );
    expect(screen.queryByRole("link", { name: "…" })).not.toBeInTheDocument();
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Breadcrumbs aria-label="Breadcrumb" items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

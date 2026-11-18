import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { EmptyState } from "./EmptyState";
import { Button } from "../Button/Button";

describe("EmptyState", () => {
  it("renders its title", () => {
    render(<EmptyState title="No projects yet" />);
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(<EmptyState title="No projects yet" description="Create one to get started." />);
    expect(screen.getByText("Create one to get started.")).toBeInTheDocument();
  });

  it("hides its icon from assistive tech", () => {
    const { container } = render(<EmptyState title="No projects yet" />);
    expect(container.querySelector(".b4-empty-state__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an action when provided", () => {
    render(<EmptyState title="No projects yet" action={<Button>New project</Button>} />);
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <EmptyState title="No projects yet" description="Create one to get started." action={<Button>New project</Button>} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

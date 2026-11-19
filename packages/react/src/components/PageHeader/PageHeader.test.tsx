import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { PageHeader } from "./PageHeader";
import { Button } from "../Button/Button";

describe("PageHeader", () => {
  it("renders the title as a real level-1 heading by default", () => {
    render(<PageHeader title="Projects" />);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
  });

  it("renders the title at the requested heading level", () => {
    render(<PageHeader title="Section" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(<PageHeader title="Projects" description="Everything your team is working on." />);
    expect(screen.getByText("Everything your team is working on.")).toBeInTheDocument();
  });

  it("renders real action controls", () => {
    render(<PageHeader title="Projects" actions={<Button>New project</Button>} />);
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });

  it("renders a breadcrumbs slot when provided", () => {
    render(<PageHeader title="Projects" breadcrumbs={<span>Home / Projects</span>} />);
    expect(screen.getByText("Home / Projects")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <PageHeader
        title="Projects"
        description="Everything your team is working on."
        breadcrumbs={<span>Home / Projects</span>}
        actions={<Button>New project</Button>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

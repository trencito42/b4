import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ErrorState } from "./ErrorState";
import { Button } from "../Button/Button";

describe("ErrorState", () => {
  it("renders its title", () => {
    render(<ErrorState title="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("announces itself as an alert", () => {
    render(<ErrorState title="Something went wrong" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(<ErrorState title="Something went wrong" description="Please try again." />);
    expect(screen.getByText("Please try again.")).toBeInTheDocument();
  });

  it("hides its icon from assistive tech", () => {
    const { container } = render(<ErrorState title="Something went wrong" />);
    expect(container.querySelector(".b4-error-state__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an action when provided", () => {
    render(<ErrorState title="Something went wrong" action={<Button>Try again</Button>} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ErrorState title="Something went wrong" description="Please try again." action={<Button>Try again</Button>} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

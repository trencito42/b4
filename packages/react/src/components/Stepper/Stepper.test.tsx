import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Stepper } from "./Stepper";

const steps = [
  { label: "Cart" },
  { label: "Shipping" },
  { label: "Payment" },
];

describe("Stepper", () => {
  it("renders an ordered list of steps", () => {
    render(<Stepper aria-label="Checkout progress" steps={steps} activeStep={1} />);
    expect(screen.getByRole("list", { name: "Checkout progress" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the active step with aria-current", () => {
    render(<Stepper aria-label="Checkout progress" steps={steps} activeStep={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("marks steps before the active one as complete", () => {
    render(<Stepper aria-label="Checkout progress" steps={steps} activeStep={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]!.className).toContain("b4-stepper__step--complete");
    expect(items[1]!.className).toContain("b4-stepper__step--complete");
    expect(items[2]!.className).toContain("b4-stepper__step--active");
  });

  it("renders step descriptions when provided", () => {
    render(
      <Stepper
        aria-label="Checkout progress"
        steps={[{ label: "Cart", description: "Review items" }]}
        activeStep={0}
      />,
    );
    expect(screen.getByText("Review items")).toBeInTheDocument();
  });

  it("has no axe violations in either orientation", async () => {
    const { container, rerender } = render(
      <Stepper aria-label="Checkout progress" steps={steps} activeStep={1} orientation="horizontal" />,
    );
    expect(await axe(container)).toHaveNoViolations();

    rerender(<Stepper aria-label="Checkout progress" steps={steps} activeStep={1} orientation="vertical" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

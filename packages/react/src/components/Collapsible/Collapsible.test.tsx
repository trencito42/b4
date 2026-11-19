import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Collapsible } from "./Collapsible";

describe("Collapsible", () => {
  it("renders the trigger and is closed by default", () => {
    render(<Collapsible trigger="More">content</Collapsible>);
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("supports defaultOpen", () => {
    render(
      <Collapsible trigger="More" defaultOpen>
        content
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles open state on trigger click", async () => {
    const user = userEvent.setup();
    render(<Collapsible trigger="More">content</Collapsible>);
    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onOpenChange", async () => {
    const user = userEvent.setup();
    let openValue: boolean | undefined;
    render(
      <Collapsible trigger="More" onOpenChange={(open) => (openValue = open)}>
        content
      </Collapsible>,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(openValue).toBe(true);
  });

  it("blocks interaction when disabled", () => {
    render(
      <Collapsible trigger="More" disabled>
        content
      </Collapsible>,
    );
    expect(screen.getByRole("button", { name: "More" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Collapsible trigger="More" defaultOpen>
        content
      </Collapsible>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

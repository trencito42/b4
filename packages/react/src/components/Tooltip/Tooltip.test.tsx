import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";

describe("Tooltip", () => {
  it("is not in the document until triggered", () => {
    render(
      <Tooltip content="Helpful text">
        <Button>Hover me</Button>
      </Tooltip>,
    );
    expect(screen.queryByText("Helpful text")).not.toBeInTheDocument();
  });

  it("shows the tooltip content when the trigger is focused", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful text">
        <Button>Hover me</Button>
      </Tooltip>,
    );

    await user.tab();
    expect(await screen.findByText("Helpful text")).toBeInTheDocument();
  });

  it("the trigger keeps working as the original component (still clickable)", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful text">
        <Button>Click me</Button>
      </Tooltip>,
    );

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    await user.click(button);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tooltip content="Helpful text">
        <Button>Hover me</Button>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByText("Helpful text");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

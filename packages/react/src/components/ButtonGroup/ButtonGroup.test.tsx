import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "../Button/Button";

describe("ButtonGroup", () => {
  it("renders as an ARIA group with the given label", () => {
    render(
      <ButtonGroup aria-label="Zoom">
        <Button>-</Button>
        <Button>+</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Zoom" })).toBeInTheDocument();
  });

  it("each button remains independently clickable", async () => {
    const onDecrease = vi.fn();
    const onIncrease = vi.fn();
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="Zoom">
        <Button onClick={onDecrease}>-</Button>
        <Button onClick={onIncrease}>+</Button>
      </ButtonGroup>,
    );

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(onIncrease).toHaveBeenCalledTimes(1);
    expect(onDecrease).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ButtonGroup aria-label="Zoom">
        <Button>-</Button>
        <Button>100%</Button>
        <Button>+</Button>
      </ButtonGroup>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

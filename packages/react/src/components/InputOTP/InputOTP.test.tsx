import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InputOTP } from "./InputOTP";

function slots(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>(".b4-input-otp__slot"));
}

describe("InputOTP", () => {
  it("renders one slot per configured length", () => {
    render(<InputOTP label="Verification code" length={4} />);
    expect(slots()).toHaveLength(4);
  });

  it("labels the field", () => {
    render(<InputOTP label="Verification code" />);
    expect(screen.getByText("Verification code")).toBeInTheDocument();
  });

  it("types across slots and reports the accumulated value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<InputOTP label="Verification code" length={4} onValueChange={onValueChange} />);

    await user.click(slots()[0]!);
    await user.keyboard("12");

    expect(onValueChange).toHaveBeenLastCalledWith("12");
  });

  it("fires onComplete once every slot is filled", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<InputOTP label="Verification code" length={4} onComplete={onComplete} />);

    await user.click(slots()[0]!);
    await user.keyboard("1234");

    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("rejects characters outside the validation type", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InputOTP label="Verification code" length={4} validationType="numeric" onValueChange={onValueChange} />,
    );

    await user.click(slots()[0]!);
    await user.keyboard("ab");

    // Letters never reach the value in numeric mode.
    expect(onValueChange).not.toHaveBeenCalledWith(expect.stringMatching(/[ab]/));
  });

  it("accepts letters when validationType is alphanumeric", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <InputOTP label="Code" length={4} validationType="alphanumeric" onValueChange={onValueChange} />,
    );

    await user.click(slots()[0]!);
    await user.keyboard("a1");

    expect(onValueChange).toHaveBeenLastCalledWith("a1");
  });

  it("removes the last character on backspace", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<InputOTP label="Code" length={4} onValueChange={onValueChange} />);

    await user.click(slots()[0]!);
    await user.keyboard("12");
    await user.keyboard("{Backspace}");

    expect(onValueChange).toHaveBeenLastCalledWith("1");
  });

  it("supports controlled usage", async () => {
    function Controlled() {
      const [value, setValue] = useState("");
      return <InputOTP label="Code" length={4} value={value} onValueChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);

    await user.click(slots()[0]!);
    await user.keyboard("7");

    expect(slots()[0]!.value).toBe("7");
  });

  it("renders a default value across the slots", () => {
    render(<InputOTP label="Code" length={4} defaultValue="1234" />);
    expect(slots().map((s) => s.value)).toEqual(["1", "2", "3", "4"]);
  });

  it("blocks typing when disabled and when read-only", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <InputOTP label="Code" length={4} disabled onValueChange={onValueChange} />,
    );
    await user.click(slots()[0]!);
    await user.keyboard("1");
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(<InputOTP label="Code" length={4} readOnly onValueChange={onValueChange} />);
    await user.click(slots()[0]!);
    await user.keyboard("1");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("carries autocomplete=one-time-code so OS/password-manager autofill works", () => {
    // The single most common thing a hand-rolled OTP input breaks.
    const { container } = render(<InputOTP label="Code" length={4} />);
    expect(container.querySelector('[autocomplete="one-time-code"]')).toBeInTheDocument();
  });

  it("shows an error message and marks the group invalid", () => {
    const { container } = render(<InputOTP label="Code" length={4} error="That code expired." />);
    expect(screen.getByText("That code expired.")).toBeInTheDocument();
    expect(container.querySelector(".b4-input-otp")).toHaveAttribute("data-invalid");
  });

  it("applies the visual grouping marker without splitting the value", () => {
    const { container } = render(<InputOTP label="Code" length={6} groupEvery={3} defaultValue="123456" />);
    const grouped = container.querySelectorAll(".b4-input-otp__slot[data-group-end]");
    // Only after slot 3 — never after the final slot.
    expect(grouped).toHaveLength(1);
    expect(slots().map((s) => s.value).join("")).toBe("123456");
  });

  it("has no axe violations across sizes, masked, error and disabled states", async () => {
    const { container } = render(
      <div>
        <InputOTP label="Code sm" size="sm" length={4} />
        <InputOTP label="Code md" size="md" length={4} />
        <InputOTP label="Code lg" size="lg" length={4} />
        <InputOTP label="Masked code" mask length={4} defaultValue="12" />
        <InputOTP label="Invalid code" length={4} error="Expired." />
        <InputOTP label="Disabled code" length={4} disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is labeled and accepts multi-line input", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Description" />);

    const textarea = screen.getByRole("textbox", { name: "Description" });
    await user.type(textarea, "line one{enter}line two");

    expect(textarea).toHaveValue("line one\nline two");
  });

  it("shows the error message instead of the hint", () => {
    render(<Textarea label="Description" hint="A hint." error="Required." />);
    expect(screen.getByText("Required.")).toBeInTheDocument();
    expect(screen.queryByText("A hint.")).not.toBeInTheDocument();
  });

  it("blocks typing when disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Description" disabled />);

    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea).toBeDisabled();
    await user.type(textarea, "a");
    expect(textarea).toHaveValue("");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Textarea label="Default" />
        <Textarea label="With error" error="Required." />
        <Textarea label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

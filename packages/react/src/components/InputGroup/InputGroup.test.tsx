import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@base-ui/react/input";
import { axe } from "jest-axe";
import { InputGroup } from "./InputGroup";

function Website(props: { error?: string }) {
  return (
    <InputGroup label="Website" startAddon="https://" error={props.error}>
      <Input className="b4-text-field__input" placeholder="example.com" />
    </InputGroup>
  );
}

describe("InputGroup", () => {
  it("is labeled and accepts typed input alongside a visible addon", async () => {
    const user = userEvent.setup();
    render(<Website />);

    expect(screen.getByText("https://")).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Website" });
    await user.type(input, "example.com");
    expect(input).toHaveValue("example.com");
  });

  it("shows the error message when provided", () => {
    render(<Website error="Enter a valid domain." />);
    expect(screen.getByText("Enter a valid domain.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Website />
        <Website error="Required." />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

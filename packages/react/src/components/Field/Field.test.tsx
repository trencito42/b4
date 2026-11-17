import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field as BaseField } from "@base-ui/react/field";
import { axe } from "jest-axe";
import { Field } from "./Field";

function SelectControl() {
  return (
    <BaseField.Control
      render={
        <select>
          <option>Graphite</option>
        </select>
      }
    />
  );
}

describe("Field", () => {
  it("associates the label with a control rendered via Field.Control", () => {
    render(
      <Field label="Favorite color">
        <SelectControl />
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Favorite color" })).toBeInTheDocument();
  });

  it("shows the error message instead of the hint", () => {
    render(
      <Field label="Favorite color" hint="A hint." error="Required.">
        <SelectControl />
      </Field>,
    );
    expect(screen.getByText("Required.")).toBeInTheDocument();
    expect(screen.queryByText("A hint.")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Field label="Default">
          <SelectControl />
        </Field>
        <Field label="With error" error="Required.">
          <SelectControl />
        </Field>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

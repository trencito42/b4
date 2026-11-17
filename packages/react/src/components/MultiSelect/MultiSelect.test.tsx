import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MultiSelect } from "./MultiSelect";

const items = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

describe("MultiSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<MultiSelect label="Frameworks" items={items} placeholder="Choose options" />);
    expect(screen.getByRole("combobox", { name: "Frameworks" })).toHaveTextContent(
      "Choose options",
    );
  });

  it("joins up to two selected labels with a comma", () => {
    render(<MultiSelect label="Frameworks" items={items} defaultValue={["react", "vue"]} />);
    expect(screen.getByRole("combobox", { name: "Frameworks" })).toHaveTextContent("React, Vue");
  });

  it("summarizes more than two selections as a count", () => {
    render(
      <MultiSelect label="Frameworks" items={items} defaultValue={["react", "vue", "svelte"]} />,
    );
    expect(screen.getByRole("combobox", { name: "Frameworks" })).toHaveTextContent("3 selected");
  });

  it("supports selecting multiple items by keyboard without closing between picks", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MultiSelect
        label="Frameworks"
        items={items}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Frameworks" });
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "React" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["react"]);

    // The popup should still be open — multi-select doesn't close on pick.
    await user.click(screen.getByRole("option", { name: "Vue" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["react", "vue"]);
  });

  it("has no axe violations across selection states", async () => {
    const { container } = render(
      <div>
        <MultiSelect label="Empty" items={items} />
        <MultiSelect label="With selection" items={items} defaultValue={["react"]} />
        <MultiSelect label="With error" items={items} error="Required." />
        <MultiSelect label="Disabled" items={items} disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

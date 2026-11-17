import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Combobox } from "./Combobox";

const items = [
  { value: "de", label: "Germany" },
  { value: "nl", label: "Netherlands", disabled: true },
  { value: "ro", label: "Romania" },
];
describe("Combobox", () => {
  it("labels the input and forwards its ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Combobox
        ref={ref}
        label="Region"
        hint="Choose a country"
        items={items}
        defaultValue="ro"
      />,
    );
    const input = screen.getByRole("combobox", { name: "Region" });
    expect(ref.current).toBe(input);
    expect(input).toHaveValue("Romania");
    expect(input).toHaveAccessibleDescription("Choose a country");
  });
  it("filters by display labels rather than IDs", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Region" items={items} />);
    await user.type(screen.getByRole("combobox"), "Roma");
    expect(await screen.findByRole("option", { name: /Romania/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Germany/ })).not.toBeInTheDocument();
  });
  it("selects using the keyboard while retaining focus in the input", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Combobox label="Region" items={items} onValueChange={change} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Roma");
    await screen.findByRole("option", { name: /Romania/ });
    await user.keyboard("{ArrowDown}{Enter}");
    expect(change).toHaveBeenCalledWith("ro");
    expect(input).toHaveValue("Romania");
    expect(input).toHaveFocus();
  });
  it("keeps controlled selection synchronized and clears it", async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState<string | null>("ro");
      return (
        <Combobox label="Region" items={items} value={value} onValueChange={setValue} />
      );
    }
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
  it("does not select disabled options", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Combobox label="Region" items={items} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Show options" }));
    await user.click(await screen.findByRole("option", { name: /Netherlands/ }));
    expect(change).not.toHaveBeenCalled();
  });
  it("blocks edits while disabled or read-only", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox label="Disabled" items={items} disabled />
        <Combobox label="Read only" items={items} readOnly defaultValue="ro" />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Disabled" })).toBeDisabled();
    await user.type(screen.getByRole("combobox", { name: "Read only" }), "abc");
    expect(screen.getByRole("combobox", { name: "Read only" })).toHaveValue("Romania");
  });
  it("shows a no-results message without a fake option", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Region" items={items} />);
    await user.type(screen.getByRole("combobox"), "not a country");
    expect(await screen.findByText("No matching options")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
  it("removes stale results while loading", async () => {
    const user = userEvent.setup();
    render(<Combobox label="Region" items={items} loading />);
    await user.click(screen.getByRole("button", { name: "Show options" }));
    expect(await screen.findByText("Loading options")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
  it("preserves selection by ID when records are replaced", () => {
    const { rerender } = render(<Combobox label="Region" items={items} value="ro" />);
    rerender(
      <Combobox label="Region" items={items.map((item) => ({ ...item }))} value="ro" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Romania");
  });
  it("submits the selected ID rather than search text", () => {
    const { container } = render(
      <form>
        <Combobox label="Region" items={items} name="region" defaultValue="ro" />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("region")).toBe("ro");
  });
  it("associates the error and marks the input invalid", () => {
    render(
      <Combobox label="Region" items={items} hint="Choose" error="Region unavailable" />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      "Region unavailable",
    );
    expect(screen.queryByText("Choose")).not.toBeInTheDocument();
  });
  it.each(["sm", "md", "lg"] as const)(
    "is axe-clean with its popup open at size %s",
    async (size) => {
      const user = userEvent.setup();
      render(<Combobox label="Region" items={items} size={size} />);
      await user.click(screen.getByRole("button", { name: "Show options" }));
      await screen.findByRole("listbox");
      expect(
        await axe(document.body, { rules: { region: { enabled: false } } }),
      ).toHaveNoViolations();
    },
  );
});

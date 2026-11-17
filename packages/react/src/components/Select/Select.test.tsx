import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Select, type SelectItem } from "./Select";

const items: SelectItem[] = [
  { value: "draft", label: "Draft", description: "Only visible to you" },
  { value: "review", label: "In review", disabled: true },
  { value: "published", label: "Published", description: "Visible to everyone" },
];

describe("Select", () => {
  it("associates the Field label, hint and trigger ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select
        ref={ref}
        label="Visibility"
        hint="Choose who can see this."
        items={items}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Visibility" });
    expect(trigger).toHaveTextContent("Choose an option");
    expect(trigger).toHaveAccessibleDescription("Choose who can see this.");
    expect(ref.current).toBe(trigger);
  });

  it("resolves default selection labels before the popup has opened", () => {
    render(<Select label="Visibility" items={items} defaultValue="published" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Published");
  });

  it("updates controlled values and supports clearing to null", async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState<string | null>("draft");
      return (
        <>
          <Select
            label="Visibility"
            items={items}
            value={value}
            onValueChange={setValue}
          />
          <button onClick={() => setValue(null)}>Clear</button>
        </>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Published/ }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Published");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose an option");
  });

  it("keeps a controlled selection until its owner updates it", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <Select label="Visibility" items={items} value="draft" onValueChange={change} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Published/ }));
    expect(change).toHaveBeenCalledWith("published");
    expect(screen.getByRole("combobox")).toHaveTextContent("Draft");
  });

  it("supports keyboard navigation without selecting disabled items", async () => {
    const user = userEvent.setup();
    render(<Select label="Visibility" items={items} defaultValue="draft" />);
    await user.tab();
    await user.keyboard("{Enter}");
    const selected = await screen.findByRole("option", { name: /Draft/ });
    await waitFor(() => expect(selected).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    // Disabled options remain discoverable with arrow keys in Base UI.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /In review/ })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("combobox")).toHaveTextContent("Draft");
    await user.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /Published/ })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("combobox")).toHaveTextContent("Published");
  });

  it("blocks disabled and read-only controls", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <Select label="Disabled" items={items} disabled />
        <Select
          label="Read only"
          items={items}
          readOnly
          defaultValue="draft"
          onValueChange={change}
        />
      </>,
    );
    expect(screen.getByRole("combobox", { name: "Disabled" })).toBeDisabled();
    await user.click(screen.getByRole("combobox", { name: "Disabled" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Read only" }));
    // Base UI allows inspecting read-only choices, but blocks changing them.
    await user.click(await screen.findByRole("option", { name: /Published/ }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox", { name: "Read only" })).toHaveTextContent(
      "Draft",
    );
  });

  it("replaces the hint with an associated error", () => {
    render(
      <Select
        label="Visibility"
        items={items}
        hint="Choose one"
        error="Please choose a status."
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      "Please choose a status.",
    );
    expect(screen.queryByText("Choose one")).not.toBeInTheDocument();
  });

  it("submits the value rather than its display label", () => {
    const { container } = render(
      <form>
        <Select label="Visibility" items={items} name="status" defaultValue="published" />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("status")).toBe(
      "published",
    );
  });

  it("refreshes the selected label when items change", () => {
    const { rerender } = render(
      <Select label="Visibility" items={items} value="draft" />,
    );
    rerender(
      <Select
        label="Visibility"
        items={[{ value: "draft", label: "Private draft" }]}
        value="draft"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Private draft");
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <Select
        label="Visibility"
        items={items}
        defaultValue="draft"
        onValueChange={change}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /In review/ }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox")).toHaveTextContent("Draft");
  });

  it("renders an empty collection without fake selectable items", async () => {
    const user = userEvent.setup();
    render(<Select label="Visibility" items={[]} />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("status")).toHaveTextContent("No options available");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "is axe-clean at size %s, including its open popup",
    async (size) => {
      const user = userEvent.setup();
      render(
        <Select label="Visibility" items={items} size={size} defaultValue="draft" />,
      );
      // Portal is outside RTL's container. Scan body, disabling only the
      // full-page landmark rule for this isolated component (TESTING.md).
      expect(
        await axe(document.body, { rules: { region: { enabled: false } } }),
      ).toHaveNoViolations();
      await user.click(screen.getByRole("combobox"));
      await screen.findByRole("listbox");
      await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
      expect(
        await axe(document.body, { rules: { region: { enabled: false } } }),
      ).toHaveNoViolations();
    },
  );
});

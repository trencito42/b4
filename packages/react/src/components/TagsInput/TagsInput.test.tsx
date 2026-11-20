import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TagsInput } from "./TagsInput";

function tagNames(): string[] {
  return screen
    .getAllByRole("button", { name: /^Remove / })
    .map((button) => button.getAttribute("aria-label")!.replace("Remove ", ""));
}

describe("TagsInput", () => {
  it("renders its initial tags and labels the draft input", () => {
    render(<TagsInput label="Topics" defaultValue={["react", "css"]} />);
    expect(screen.getByLabelText("Topics")).toBeInTheDocument();
    expect(tagNames()).toEqual(["react", "css"]);
  });

  it("commits a tag on Enter and clears the draft", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "design{Enter}");
    expect(tagNames()).toEqual(["design"]);
    expect(input).toHaveValue("");
  });

  it("commits on comma when addOnComma is on", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" />);
    await user.type(screen.getByLabelText("Topics"), "one,");
    expect(tagNames()).toEqual(["one"]);
  });

  it("keeps the comma in the draft when addOnComma is off", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" addOnComma={false} />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "a,b");
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);
    expect(input).toHaveValue("a,b");
  });

  it("trims whitespace and ignores an empty draft", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "   {Enter}");
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);

    await user.type(input, "  spaced  {Enter}");
    expect(tagNames()).toEqual(["spaced"]);
  });

  it("rejects duplicates by default", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" defaultValue={["react"]} />);
    await user.type(screen.getByLabelText("Topics"), "react{Enter}");
    expect(tagNames()).toEqual(["react"]);
  });

  it("allows duplicates when configured", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" allowDuplicates defaultValue={["react"]} />);
    await user.type(screen.getByLabelText("Topics"), "react{Enter}");
    expect(tagNames()).toEqual(["react", "react"]);
  });

  it("lowercases tags when configured, which also makes duplicates case-insensitive", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" lowercase defaultValue={["react"]} />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "React{Enter}");
    expect(tagNames()).toEqual(["react"]);

    await user.type(input, "CSS{Enter}");
    expect(tagNames()).toEqual(["react", "css"]);
  });

  it("splits a multi-value paste into separate tags in one change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TagsInput label="Topics" onValueChange={onValueChange} />);

    await user.click(screen.getByLabelText("Topics"));
    await user.paste("alpha, beta,gamma");

    expect(tagNames()).toEqual(["alpha", "beta", "gamma"]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(["alpha", "beta", "gamma"]);
  });

  it("leaves a single-token paste in the draft so it stays editable", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" />);
    const input = screen.getByLabelText("Topics");

    await user.click(input);
    await user.paste("just-one");

    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);
    expect(input).toHaveValue("just-one");
  });

  it("removes the last tag on Backspace from an empty draft, but not while typing", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" defaultValue={["a", "b"]} />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "typing");
    await user.keyboard("{Backspace}");
    expect(tagNames()).toEqual(["a", "b"]);

    await user.clear(input);
    await user.keyboard("{Backspace}");
    expect(tagNames()).toEqual(["a"]);
  });

  it("removes an individual tag from its accessible remove button", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" defaultValue={["keep", "drop", "keep2"]} />);

    await user.click(screen.getByRole("button", { name: "Remove drop" }));
    expect(tagNames()).toEqual(["keep", "keep2"]);
  });

  it("enforces maxTags and maxLength", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" maxTags={2} maxLength={5} defaultValue={["one"]} />);
    const input = screen.getByLabelText("Topics");

    await user.click(input);
    await user.paste("toolongvalue,ok,third");

    // "toolongvalue" exceeds maxLength; "third" exceeds maxTags.
    expect(tagNames()).toEqual(["one", "ok"]);
  });

  it("rejects tags failing a custom validate", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" validate={(tag) => tag.startsWith("ok")} />);
    const input = screen.getByLabelText("Topics");

    await user.type(input, "nope{Enter}");
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);

    await user.type(input, "ok-good{Enter}");
    expect(tagNames()).toEqual(["ok-good"]);
  });

  it("supports controlled usage", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return <TagsInput label="Topics" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);

    await user.type(screen.getByLabelText("Topics"), "x{Enter}");
    expect(tagNames()).toEqual(["x"]);
  });

  it("does not commit Enter while an IME composition is active", async () => {
    render(<TagsInput label="Topics" />);
    const input = screen.getByLabelText("Topics") as HTMLInputElement;

    input.focus();
    await userEvent.setup().type(input, "にほ");
    // Simulate the Enter that accepts an IME candidate.
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );

    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);
  });

  it("commits a pending draft on blur rather than dropping it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <TagsInput label="Topics" />
        <button type="button">elsewhere</button>
      </>,
    );

    await user.type(screen.getByLabelText("Topics"), "pending");
    await user.click(screen.getByRole("button", { name: "elsewhere" }));

    expect(tagNames()).toEqual(["pending"]);
  });

  it("hides remove buttons and blocks edits when readOnly", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" readOnly defaultValue={["locked"]} />);

    expect(screen.queryAllByRole("button", { name: /^Remove / })).toHaveLength(0);
    await user.type(screen.getByLabelText("Topics"), "new{Enter}");
    expect(screen.getByText("locked")).toBeInTheDocument();
  });

  it("disables the draft input when disabled", () => {
    render(<TagsInput label="Topics" disabled defaultValue={["x"]} />);
    expect(screen.getByLabelText("Topics")).toBeDisabled();
  });

  it("submits one hidden input per tag when given a name", () => {
    const { container } = render(
      <TagsInput label="Topics" name="topics" defaultValue={["a", "b"]} />,
    );
    const hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="topics"]');
    expect([...hidden].map((input) => input.value)).toEqual(["a", "b"]);
  });

  it("steps from the draft into the tag list with ArrowLeft and removes with Backspace", async () => {
    const user = userEvent.setup();
    render(<TagsInput label="Topics" defaultValue={["first", "last"]} />);

    await user.click(screen.getByLabelText("Topics"));
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Remove last" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Remove first" })).toHaveFocus();

    await user.keyboard("{Backspace}");
    expect(tagNames()).toEqual(["last"]);
  });

  it("associates the hint with the draft input for screen readers", () => {
    render(<TagsInput label="Topics" hint="Press Enter to add" />);
    expect(screen.getByLabelText("Topics")).toHaveAccessibleDescription("Press Enter to add");
  });

  it("shows an error message instead of the hint", () => {
    render(<TagsInput label="Topics" hint="Hint text" error="Error text" />);
    expect(screen.getByText("Error text")).toBeInTheDocument();
    expect(screen.queryByText("Hint text")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TagsInput label="Topics" hint="Press Enter to add" defaultValue={["react", "css"]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

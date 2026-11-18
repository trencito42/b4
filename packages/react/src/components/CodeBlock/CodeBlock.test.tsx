import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CodeBlock } from "./CodeBlock";

const code = "const x = 1;\nconst y = 2;";

// @testing-library/user-event's setup() installs its own navigator.clipboard
// stub (for its copy()/paste() helpers) the moment it's called, overwriting
// whatever's there beforehand — so the mock has to be installed *after*
// userEvent.setup(), not before, or every assertion silently exercises
// user-event's stub (which always resolves) instead of this test's mock.
function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe("CodeBlock", () => {
  it("renders the code", () => {
    const { container } = render(<CodeBlock code={code} />);
    const codeEl = container.querySelector(".b4-code-block__code");
    expect(codeEl?.textContent).toBe(code);
  });

  it("renders the language label", () => {
    render(<CodeBlock code={code} language="typescript" />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("defaults the language label to 'code'", () => {
    render(<CodeBlock code={code} />);
    expect(screen.getByText("code")).toBeInTheDocument();
  });

  it("copies the code to the clipboard and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<CodeBlock code={code} />);

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(writeText).toHaveBeenCalledWith(code);
    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
  });

  it("surfaces a distinct failure state, not a silent no-op, when the clipboard write is denied", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    writeText.mockRejectedValue(new DOMException("Write permission denied", "NotAllowedError"));
    render(<CodeBlock code={code} />);

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Copy failed" })).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Copy to clipboard failed");
  });

  it("renders line numbers when requested", () => {
    const { container } = render(<CodeBlock code={code} showLineNumbers />);
    const numbers = container.querySelectorAll(".b4-code-block__line-number");
    expect(numbers).toHaveLength(2);
    expect(numbers[0]).toHaveTextContent("1");
    expect(numbers[1]).toHaveTextContent("2");
  });

  it("has no axe violations", async () => {
    const { container } = render(<CodeBlock code={code} language="javascript" showLineNumbers />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

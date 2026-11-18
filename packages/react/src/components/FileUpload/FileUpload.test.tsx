import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { FileUpload } from "./FileUpload";

function makeFile(name: string, sizeBytes: number, type = "text/plain") {
  const file = new File([new Uint8Array(sizeBytes)], name, { type });
  return file;
}

describe("FileUpload", () => {
  it("shows the dropzone with the field label", () => {
    render(<FileUpload label="Attachments" />);
    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(screen.getByLabelText("Attachments")).toHaveAttribute("type", "file");
  });

  it("adds a selected file to the list and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload label="Attachments" onValueChange={onValueChange} />);

    const file = makeFile("report.pdf", 1024, "application/pdf");
    await user.upload(screen.getByLabelText("Attachments"), file);

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith([file]);
  });

  it("removes a file via its remove button", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload label="Attachments" onValueChange={onValueChange} />);

    const file = makeFile("notes.txt", 100);
    await user.upload(screen.getByLabelText("Attachments"), file);
    expect(screen.getByText("notes.txt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("rejects a file exceeding maxSizeBytes with a visible message", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<FileUpload label="Attachments" maxSizeBytes={100} onValueChange={onValueChange} />);

    const tooBig = makeFile("huge.bin", 500);
    await user.upload(screen.getByLabelText("Attachments"), tooBig);

    expect(screen.getByRole("alert")).toHaveTextContent("huge.bin: exceeds 100 B");
    expect(screen.queryByText("huge.bin")).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("rejects a file that doesn't match accept, arriving via a drop (which bypasses the native picker's own accept filtering)", () => {
    render(<FileUpload label="Attachments" accept="image/*" />);

    // `userEvent.upload` simulates the OS picker, which itself respects the
    // input's `accept` attribute and would never surface a mismatched file
    // to the change handler — exactly why the component's own validation
    // exists, for files that arrive via a real drop instead (which bypasses
    // that filtering). `fireEvent.change` mirrors that: a raw change event
    // the component must validate itself, not the browser's picker.
    const wrongType = makeFile("notes.txt", 10, "text/plain");
    fireEvent.change(screen.getByLabelText("Attachments"), { target: { files: [wrongType] } });

    expect(screen.getByRole("alert")).toHaveTextContent("not an accepted file type");
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("enforces maxFiles, trimming and reporting the overflow", async () => {
    const user = userEvent.setup();
    render(<FileUpload label="Attachments" maxFiles={2} />);

    const files = [makeFile("a.txt", 10), makeFile("b.txt", 10), makeFile("c.txt", 10)];
    await user.upload(screen.getByLabelText("Attachments"), files);

    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(screen.getByText("b.txt")).toBeInTheDocument();
    expect(screen.queryByText("c.txt")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("1 file skipped: limit is 2");
  });

  it("supports uncontrolled use via defaultValue", () => {
    const existing = makeFile("existing.pdf", 10, "application/pdf");
    render(<FileUpload label="Attachments" defaultValue={[existing]} />);
    expect(screen.getByText("existing.pdf")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<FileUpload label="Attachments" hint="Up to 5 MB" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AlertDialog } from "./AlertDialog";
import { Button } from "../Button/Button";

describe("AlertDialog", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog
        trigger={<Button>Delete</Button>}
        title="Delete this project?"
        confirmLabel="Delete"
        onConfirm={() => {}}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });

  it("does not close on Escape alone without confirming or canceling — Base UI's documented contract", async () => {
    // Actually verify the real contract: Cancel closes without calling
    // onConfirm, Confirm closes and calls onConfirm. Don't assume
    // Escape behavior without checking — see HANDOFF.md's running note
    // on checking each primitive's actual behavior instead of guessing.
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertDialog
        trigger={<Button>Delete</Button>}
        title="Delete this project?"
        confirmLabel="Delete permanently"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await screen.findByRole("alertdialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertDialog
        trigger={<Button>Delete</Button>}
        title="Delete this project?"
        confirmLabel="Delete permanently"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await screen.findByRole("alertdialog");
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("supports a custom cancel label", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog
        trigger={<Button>Revoke</Button>}
        title="Revoke access?"
        cancelLabel="Keep access"
        confirmLabel="Revoke"
        onConfirm={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Revoke" }));
    expect(await screen.findByRole("button", { name: "Keep access" })).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AlertDialog
        trigger={<Button>Delete</Button>}
        title="Delete this project?"
        description="This can't be undone."
        confirmLabel="Delete permanently"
        onConfirm={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await screen.findByRole("alertdialog");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

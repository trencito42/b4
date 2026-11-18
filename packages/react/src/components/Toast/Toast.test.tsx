import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ToastProvider, useToast } from "./Toast";
import { Button } from "../Button/Button";

function TriggerToast({
  title = "Changes saved",
  ...rest
}: { title?: string } & Record<string, unknown>) {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.add({ title, ...rest } as Parameters<typeof toast.add>[0])
      }
    >
      Trigger
    </Button>
  );
}

describe("Toast", () => {
  it("shows nothing until a toast is added", () => {
    render(
      <ToastProvider>
        <TriggerToast />
      </ToastProvider>,
    );
    expect(screen.queryByText("Changes saved")).not.toBeInTheDocument();
  });

  it("adds a toast with a title and description on demand", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TriggerToast title="Saved" description="Your draft is up to date." />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your draft is up to date.")).toBeInTheDocument();
  });

  it("dismisses a toast via its close button", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TriggerToast title="Dismiss me" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    const toastRoot = await screen.findByText("Dismiss me");
    // Base UI's Toast.Close is aria-hidden while its toast isn't the
    // expanded/hovered one in the stack (so a screen reader doesn't land
    // on dismiss controls for toasts the user can't currently see) —
    // hover (focus) the toast first, the same way a sighted mouse user
    // would before reaching for its close button.
    await user.hover(toastRoot);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("renders an action button that invokes its own onClick", async () => {
    const user = userEvent.setup();
    let undone = false;
    function TriggerWithAction() {
      const toast = useToast();
      return (
        <Button
          onClick={() =>
            toast.add({
              title: "Item deleted",
              actionProps: { children: "Undo", onClick: () => (undone = true) },
            })
          }
        >
          Trigger
        </Button>
      );
    }
    render(
      <ToastProvider>
        <TriggerWithAction />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await screen.findByText("Item deleted");
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(undone).toBe(true);
  });

  it("supports multiple simultaneous toasts", async () => {
    const user = userEvent.setup();
    function TriggerTwo() {
      const toast = useToast();
      return (
        <Button
          onClick={() => {
            toast.add({ title: "First" });
            toast.add({ title: "Second" });
          }}
        >
          Trigger
        </Button>
      );
    }
    render(
      <ToastProvider>
        <TriggerTwo />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(await screen.findByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("has no axe violations while a toast is shown", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ToastProvider>
        <TriggerToast title="Accessible toast" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await screen.findByText("Accessible toast");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

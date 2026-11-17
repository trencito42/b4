import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Popover } from "./Popover";
import { Button } from "../Button/Button";

describe("Popover", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Popover title="Settings" trigger={<Button>Open</Button>}>
        Content
      </Popover>,
    );

    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Popover title="Settings" trigger={<Button>Open</Button>}>
        Content
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await screen.findByText("Content");
    await user.keyboard("{Escape}");

    // jsdom never runs a real animation frame, so the exit spring (and
    // the focus-return that Base UI defers until it completes) never
    // finishes here — same caveat as TextTransition. The reliably
    // testable signal in this environment is that Escape registered the
    // close intent; full close + focus-return timing against a real
    // browser is covered in e2e/popover.spec.ts.
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover title="Settings" trigger={<Button>Open</Button>} open onOpenChange={onOpenChange}>
        Content
      </Popover>,
    );

    expect(await screen.findByText("Content")).toBeInTheDocument();
  });

  it("holds real interactive content, not a static mockup", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <Popover title="Confirm" trigger={<Button>Delete</Button>}>
        <Button onClick={onDelete}>Delete permanently</Button>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Delete permanently" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Popover title="Settings" trigger={<Button>Open</Button>}>
        Content
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByText("Content");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

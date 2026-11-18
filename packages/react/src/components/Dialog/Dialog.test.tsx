import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";

describe("Dialog", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Edit profile" trigger={<Button>Open</Button>}>
        Content
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
  });

  it("shows the description when provided", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Edit profile" description="Update your info." trigger={<Button>Open</Button>}>
        Content
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Update your info.")).toBeInTheDocument();
  });

  it("closes via the close button", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Edit profile" trigger={<Button>Open</Button>}>
        Content
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-closed", "");
  });

  it("supports controlled open state", async () => {
    render(
      <Dialog title="Edit profile" open onOpenChange={() => {}}>
        Content
      </Dialog>,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Dialog title="Edit profile" description="Update your info." trigger={<Button>Open</Button>}>
        Content
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

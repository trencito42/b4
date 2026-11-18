import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Sheet } from "./Sheet";
import { Button } from "../Button/Button";

describe("Sheet", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Sheet title="Filters" trigger={<Button>Open</Button>}>
        Content
      </Sheet>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("shows the description when provided", async () => {
    const user = userEvent.setup();
    render(
      <Sheet title="Filters" description="Narrow down the results." trigger={<Button>Open</Button>}>
        Content
      </Sheet>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Narrow down the results.")).toBeInTheDocument();
  });

  it("closes via the close button", async () => {
    const user = userEvent.setup();
    render(
      <Sheet title="Filters" trigger={<Button>Open</Button>}>
        Content
      </Sheet>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    render(
      <Sheet title="Filters" open onOpenChange={() => {}}>
        Content
      </Sheet>,
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Sheet title="Filters" description="Narrow down the results." trigger={<Button>Open</Button>}>
        Content
      </Sheet>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

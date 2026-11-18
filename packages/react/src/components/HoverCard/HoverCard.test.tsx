import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { HoverCard } from "./HoverCard";
import { Link } from "../Link/Link";

describe("HoverCard", () => {
  it("is not in the document until the trigger is hovered/focused", () => {
    render(
      <HoverCard trigger={<Link href="#">@ada</Link>}>Ada Lovelace</HoverCard>,
    );
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  });

  it("shows its content when the trigger is focused", async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<Link href="#">@ada</Link>}>Ada Lovelace</HoverCard>,
    );

    await user.tab();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("the trigger remains a real, usable link", () => {
    render(
      <HoverCard trigger={<Link href="/ada">@ada</Link>}>Ada Lovelace</HoverCard>,
    );
    expect(screen.getByRole("link", { name: "@ada" })).toHaveAttribute("href", "/ada");
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <HoverCard trigger={<Link href="#">@ada</Link>}>Ada Lovelace</HoverCard>,
    );
    await user.tab();
    await screen.findByText("Ada Lovelace");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

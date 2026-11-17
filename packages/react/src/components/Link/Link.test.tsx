import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Link } from "./Link";

describe("Link", () => {
  it("renders as an anchor with the given href", () => {
    render(<Link href="/docs">Docs</Link>);
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("sets target and rel safely when external", () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>,
    );
    const link = screen.getByRole("link", { name: /Example/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not set target/rel when not external", () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Link href="/a">Accent</Link>
        <Link href="/b" tone="neutral">
          Neutral
        </Link>
        <Link href="/c" external>
          External
        </Link>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

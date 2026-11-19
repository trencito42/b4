import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Beta</Badge>);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("applies the tone class", () => {
    render(<Badge tone="danger">Failed</Badge>);
    expect(screen.getByText("Failed")).toHaveClass("b4-badge--danger");
  });

  // Structural accessibility is asserted here. Color-contrast cannot be:
  // jsdom loads no stylesheet, so a colour-contrast rule would be testing
  // nothing — that check lives in e2e/badge.spec.ts, run against both
  // themes with real rendered CSS. See TESTING.md.
  it("has no axe violations", async () => {
    const { container } = render(<Badge tone="success">Verified</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

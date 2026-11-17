import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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

  // Color-contrast verification for every tone lives in
  // e2e/badge.spec.ts, run against both themes with real rendered CSS —
  // jsdom here has no stylesheet loaded, so an axe color-contrast check
  // in this file would be testing nothing. See TESTING.md.
});

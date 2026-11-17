import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status label as visible text, not color-only", () => {
    render(<StatusBadge status="online">Connected</StatusBadge>);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("hides the decorative dot from assistive tech", () => {
    const { container } = render(<StatusBadge status="offline">Offline</StatusBadge>);
    expect(container.querySelector(".b4-status-badge__dot")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("has no axe violations across all statuses", async () => {
    const { container } = render(
      <div>
        <StatusBadge status="online">Connected</StatusBadge>
        <StatusBadge status="degraded">Degraded</StatusBadge>
        <StatusBadge status="offline">Offline</StatusBadge>
        <StatusBadge status="idle">Idle</StatusBadge>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

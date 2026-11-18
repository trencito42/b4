import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { LoadingOverlay } from "./LoadingOverlay";

describe("LoadingOverlay", () => {
  it("renders nothing when not visible", () => {
    render(<LoadingOverlay visible={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a labeled spinner when visible", () => {
    render(<LoadingOverlay visible />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("supports a custom label", () => {
    render(<LoadingOverlay visible label="Saving…" />);
    expect(screen.getByRole("status", { name: "Saving…" })).toBeInTheDocument();
  });

  it("shows an optional message", () => {
    render(<LoadingOverlay visible message="Fetching data…" />);
    expect(screen.getByText("Fetching data…")).toBeInTheDocument();
  });

  it("applies the requested variant class", () => {
    const { container } = render(<LoadingOverlay visible variant="fixed" />);
    expect(container.querySelector(".b4-loading-overlay--fixed")).toBeInTheDocument();
  });

  it("has no axe violations while visible", async () => {
    const { container } = render(<LoadingOverlay visible message="Loading content" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

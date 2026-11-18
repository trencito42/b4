import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InlineAlert } from "./InlineAlert";

describe("InlineAlert", () => {
  it("renders as an alert with a title and message", () => {
    render(
      <InlineAlert tone="danger" title="Something went wrong">
        Try again.
      </InlineAlert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again.")).toBeInTheDocument();
  });

  it("renders without a title", () => {
    render(<InlineAlert tone="info">Just a message.</InlineAlert>);
    expect(screen.getByText("Just a message.")).toBeInTheDocument();
  });

  it("is not dismissible by default", () => {
    render(<InlineAlert tone="info">Message</InlineAlert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("calls onDismiss when the dismiss button is clicked", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <InlineAlert tone="warning" dismissible onDismiss={onDismiss}>
        Message
      </InlineAlert>,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("applies the requested tone class", () => {
    render(<InlineAlert tone="success">Message</InlineAlert>);
    expect(screen.getByRole("alert")).toHaveClass("b4-inline-alert--success");
  });

  it("has no axe violations across the tone matrix", async () => {
    const tones = ["info", "success", "warning", "danger"] as const;
    for (const tone of tones) {
      const { container, unmount } = render(
        <InlineAlert tone={tone} title="Title">
          Message
        </InlineAlert>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });
});

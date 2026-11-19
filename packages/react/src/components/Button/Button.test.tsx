import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Deploy</Button>);
    expect(screen.getByRole("button", { name: "Deploy" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Deploy</Button>);

    await user.click(screen.getByRole("button", { name: "Deploy" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Deploy
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Deploy" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks itself busy and disabled while loading, and blocks clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} loading>
        Deploy
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Deploy" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports keyboard activation", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Deploy</Button>);

    const button = screen.getByRole("button", { name: "Deploy" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("handles asynchronous action states with statusLabels and status tones", () => {
    const { rerender } = render(
      <Button
        status="idle"
        statusLabels={{
          idle: "Deploy app",
          pending: "Deploying…",
          success: "Deployed",
          error: "Retry deployment",
        }}
      >
        Deploy app
      </Button>,
    );

    expect(screen.getByRole("button", { name: /Deploy app/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();

    // Pending state
    rerender(
      <Button
        status="pending"
        statusLabels={{
          idle: "Deploy app",
          pending: "Deploying…",
          success: "Deployed",
          error: "Retry deployment",
        }}
      >
        Deploy app
      </Button>,
    );
    const pendingBtn = screen.getByRole("button");
    expect(pendingBtn).toBeDisabled();
    expect(pendingBtn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Deploying…")).toBeInTheDocument();

    // Success state
    rerender(
      <Button
        status="success"
        statusLabels={{
          idle: "Deploy app",
          pending: "Deploying…",
          success: "Deployed",
          error: "Retry deployment",
        }}
      >
        Deploy app
      </Button>,
    );
    const successBtn = screen.getByRole("button");
    expect(successBtn).toHaveClass("b4-button--status-success");
    expect(screen.getByText("Deployed")).toBeInTheDocument();

    // Error state
    rerender(
      <Button
        status="error"
        statusLabels={{
          idle: "Deploy app",
          pending: "Deploying…",
          success: "Deployed",
          error: "Retry deployment",
        }}
      >
        Deploy app
      </Button>,
    );
    const errorBtn = screen.getByRole("button");
    expect(errorBtn).toHaveClass("b4-button--status-error");
    expect(screen.getByText("Retry deployment")).toBeInTheDocument();
  });

  it("drives status automatically when onAction promise is provided", async () => {
    let resolveAction!: () => void;
    const actionPromise = new Promise<void>((resolve) => {
      resolveAction = resolve;
    });
    const onAction = vi.fn().mockReturnValue(actionPromise);
    const user = userEvent.setup();

    render(
      <Button
        onAction={onAction}
        statusLabels={{
          idle: "Save changes",
          pending: "Saving…",
          success: "Saved!",
        }}
      >
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: /Save changes/i });
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);

    // Should now be pending
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    // Resolve promise inside act
    await vi.waitFor(async () => {
      resolveAction();
    });
  });

  it("has no axe violations across all variants and async states", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button status="success">Success</Button>
        <Button status="error">Error</Button>
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

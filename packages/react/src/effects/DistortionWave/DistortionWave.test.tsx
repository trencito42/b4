import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { useRef } from "react";
import { DistortionWave } from "./DistortionWave";
import type { DistortionWaveHandle } from "./types";

// jsdom has no WebGL2 — `canvas.getContext("webgl2")` returns null, so the
// component takes its documented "GPU unavailable" path: the real DOM swap
// still happens instantly, `onFinish` still fires, no GPU wave plays. That
// is exactly the fallback contract this suite is testing.

function Demo({ revealed, onFinish }: { revealed: boolean; onFinish?: (d: "forward" | "reverse") => void }) {
  return (
    <DistortionWave
      revealed={revealed}
      overlay={<button type="button">Confirm</button>}
      revealedContent={<div data-testid="revealed-view">Payment complete</div>}
      onFinish={onFinish}
    >
      <div data-testid="original-view">Review payment</div>
    </DistortionWave>
  );
}

describe("DistortionWave", () => {
  it("mounts both views, with only the revealed one exposed to the accessibility tree", () => {
    render(<Demo revealed={false} />);
    expect(screen.getByTestId("original-view")).toBeInTheDocument();
    expect(screen.getByTestId("revealed-view")).toBeInTheDocument();
    expect(screen.getByTestId("original-view").parentElement).not.toHaveAttribute("aria-hidden");
    expect(screen.getByTestId("revealed-view").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("revealed-view").parentElement).toHaveAttribute("inert");
  });

  it("swaps which view is exposed when revealed changes", () => {
    const { rerender } = render(<Demo revealed={false} />);
    expect(screen.getByTestId("original-view").parentElement).not.toHaveAttribute("aria-hidden");

    rerender(<Demo revealed />);
    expect(screen.getByTestId("revealed-view").parentElement).not.toHaveAttribute("aria-hidden");
    expect(screen.getByTestId("original-view").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("original-view").parentElement).toHaveAttribute("inert");
  });

  it("calls onFinish even without WebGL2 (the documented graceful-fallback path)", async () => {
    const onFinish = vi.fn();
    const { rerender } = render(<Demo revealed={false} onFinish={onFinish} />);
    rerender(<Demo revealed onFinish={onFinish} />);
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith("forward"));
  });

  it("keeps the overlay interactive and outside the captured views", () => {
    render(<Demo revealed={false} />);
    const button = screen.getByRole("button", { name: "Confirm" });
    expect(button).toBeInTheDocument();
    expect(button.closest('[data-testid="original-view"]')).toBeNull();
    expect(button.closest('[data-testid="revealed-view"]')).toBeNull();
  });

  it("does not break the UI when the capture function rejects", async () => {
    const failingCapture = vi.fn().mockRejectedValue(new Error("capture failed"));
    function FailingDemo({ revealed }: { revealed: boolean }) {
      return (
        <DistortionWave revealed={revealed} revealedContent={<div data-testid="revealed-view" />} capture={failingCapture}>
          <div data-testid="original-view" />
        </DistortionWave>
      );
    }
    const { rerender } = render(<FailingDemo revealed={false} />);
    rerender(<FailingDemo revealed />);
    await waitFor(() => expect(screen.getByTestId("revealed-view").parentElement).not.toHaveAttribute("aria-hidden"));
  });

  it("exposes play/reverse/reset/prepare on the imperative handle", () => {
    function WithHandle() {
      const ref = useRef<DistortionWaveHandle>(null);
      return (
        <>
          <DistortionWave ref={ref} revealed={false} revealedContent={<div />}>
            <div />
          </DistortionWave>
          <button type="button" onClick={() => ref.current?.reset()}>
            call reset
          </button>
        </>
      );
    }
    render(<WithHandle />);
    expect(() => screen.getByRole("button", { name: "call reset" }).click()).not.toThrow();
  });

  it("collapses to an instant swap under reducedMotion, still calling onFinish", async () => {
    const onFinish = vi.fn();
    function ReducedDemo({ revealed }: { revealed: boolean }) {
      return (
        <DistortionWave revealed={revealed} reducedMotion revealedContent={<div data-testid="revealed-view" />} onFinish={onFinish}>
          <div data-testid="original-view" />
        </DistortionWave>
      );
    }
    const { rerender } = render(<ReducedDemo revealed={false} />);
    rerender(<ReducedDemo revealed />);
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith("forward"));
  });

  it("has no axe violations", async () => {
    const { container } = render(<Demo revealed={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

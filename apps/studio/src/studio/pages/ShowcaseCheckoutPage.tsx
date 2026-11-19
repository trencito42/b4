import { useState } from "react";
import { Button, Card, NumberTransition, PageHeader, Progress, TextMorph, toastManager } from "@b4/react";
import { RefractionSweep } from "@b4/react/effects";
import type { StudioPreviewWidth } from "../settings.js";

type FlowStatus = "review" | "pending" | "done";

const RENT_AMOUNT = 1250;
const RECIPIENT = "Maya Chen";

function previewClass(width: StudioPreviewWidth): string {
  if (width === "390") return "b4-studio__preview-frame--390";
  if (width === "768") return "b4-studio__preview-frame--768";
  if (width === "1440") return "b4-studio__preview-frame--1440";
  return "";
}

/**
 * Studio → Showcases → Confirmation. A mobile-first review-to-success
 * flow that composes B4's effect and motion primitives on one real
 * surface: RefractionSweep sweeps the card on success, and
 * TextMorph/NumberTransition carry the status and amount across each
 * state change. Reverse/reset re-plays the whole flow. No real transfer
 * happens — this is a sample flow built from public B4 components, not a
 * payment integration.
 */
export function ShowcaseCheckoutPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [status, setStatus] = useState<FlowStatus>("review");

  async function handleConfirm() {
    setStatus("pending");
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setStatus("done");
    toastManager.add({
      title: "Payment sent",
      description: `$${RENT_AMOUNT.toLocaleString()} sent to ${RECIPIENT}.`,
      type: "success",
    });
  }

  function handleReset() {
    setStatus("review");
  }

  const statusLabel = status === "review" ? "Review" : status === "pending" ? "Sending…" : "Sent";

  return (
    <div className={["b4-studio__preview-frame", previewClass(previewWidth)].filter(Boolean).join(" ")}>
      <PageHeader
        title="Confirmation"
        description="A review-to-success payment flow — sample data only, built from RefractionSweep and TextMorph."
      />
      <div className="b4-showcase-checkout" style={{ marginTop: "var(--b4-space-10)" }}>
        <RefractionSweep active={status === "done"} amplitude="sm" direction="horizontal" tone="success">
          <Card variant="raised" padding="lg" className="b4-showcase-checkout__card">
              <div className="b4-showcase-checkout__status">
                <TextMorph value={statusLabel} mode="words" as="span" className="b4-showcase-checkout__status-text" />
              </div>

              <div className="b4-showcase-checkout__amount">
                <span className="b4-showcase-checkout__amount-prefix">$</span>
                <NumberTransition
                  value={RENT_AMOUNT}
                  format={(value) => value.toLocaleString()}
                  mode="morph"
                />
              </div>

              <dl className="b4-showcase-checkout__details">
                <div className="b4-showcase-checkout__row">
                  <dt>To</dt>
                  <dd>{RECIPIENT}</dd>
                </div>
                <div className="b4-showcase-checkout__row">
                  <dt>From</dt>
                  <dd>Everyday ·· 4821</dd>
                </div>
                <div className="b4-showcase-checkout__row">
                  <dt>Note</dt>
                  <dd>Studio rent</dd>
                </div>
              </dl>

              {status === "pending" && (
                <Progress label="Sending payment" hideLabel value={null} />
              )}

              {status === "review" && (
                <Button variant="primary" size="lg" onAction={handleConfirm}>
                  Confirm
                </Button>
              )}
              {status === "done" && (
                <Button variant="secondary" size="lg" onClick={handleReset}>
                  Send another
                </Button>
              )}
            </Card>
        </RefractionSweep>
      </div>
    </div>
  );
}

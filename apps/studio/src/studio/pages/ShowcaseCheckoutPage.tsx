import { useState } from "react";
import {
  Button,
  Card,
  InlineAlert,
  NumberTransition,
  PageHeader,
  Progress,
  TextMorph,
  TransitionGroup,
  toastManager,
} from "@b4/react";
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
 * flow built from ordinary B4 components, where every visual change
 * carries state rather than decorating it: `TextMorph` morphs the status
 * word, `NumberTransition` carries the amount, `Progress` reports the
 * in-flight send, and `TransitionGroup` reveals the receipt rows that
 * only exist once the payment has actually completed.
 *
 * It previously wrapped the card in a decorative `RefractionSweep`;
 * that effect (and the whole `@b4/react/effects` entry point) was
 * removed 2026-11-20 — see CHANGELOG.md. Reset re-plays the flow. No
 * real transfer happens: this is sample state, not a payment integration.
 */
export function ShowcaseCheckoutPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [status, setStatus] = useState<FlowStatus>("review");
  const [reference, setReference] = useState<string | null>(null);

  async function handleConfirm() {
    setStatus("pending");
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setReference(`B4-${Math.floor(100000 + Math.random() * 900000)}`);
    setStatus("done");
    toastManager.add({
      title: "Payment sent",
      description: `$${RENT_AMOUNT.toLocaleString()} sent to ${RECIPIENT}.`,
      type: "success",
    });
  }

  function handleReset() {
    setStatus("review");
    setReference(null);
  }

  const statusLabel = status === "review" ? "Review" : status === "pending" ? "Sending…" : "Sent";

  return (
    <div className={["b4-studio__preview-frame", previewClass(previewWidth)].filter(Boolean).join(" ")}>
      <PageHeader
        title="Confirmation"
        description="A review-to-success payment flow — sample data only, built from ordinary B4 components and real state transitions."
      />
      <div className="b4-showcase-checkout" style={{ marginTop: "var(--b4-space-10)" }}>
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

              {/* The receipt only exists once the payment has actually
                  completed, so it enters rather than being revealed by a
                  decorative sweep over content that was already there. */}
              <TransitionGroup preset="slide-fade" gap="sm" stagger={0.05}>
                {status === "done" && reference
                  ? [
                      <div key="reference" className="b4-showcase-checkout__row">
                        <span>Reference</span>
                        <strong>{reference}</strong>
                      </div>,
                      <InlineAlert key="receipt" tone="success" title="Payment sent">
                        {RECIPIENT} will see this within a few seconds.
                      </InlineAlert>,
                    ]
                  : null}
              </TransitionGroup>

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
      </div>
    </div>
  );
}
